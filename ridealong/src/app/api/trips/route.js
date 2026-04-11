import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Trip from "@/models/Trip";
import User from "@/models/User";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Haversine formula to calculate distance between two coordinates
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

// Projection of a point onto a line segment
// Returns { distance (km), t (0=source, 1=dest) } 
const getSegmentProjection = (lng, lat, source, dest) => {
    const avgLat = (lat + source.lat + dest.lat) / 3 * Math.PI / 180;
    const kx = 111.32 * Math.cos(avgLat);
    const ky = 111.32;
    
    const p = { x: lng * kx, y: lat * ky };
    const a = { x: source.lng * kx, y: source.lat * ky };
    const b = { x: dest.lng * kx, y: dest.lat * ky };
    
    const ab = { x: b.x - a.x, y: b.y - a.y };
    const ap = { x: p.x - a.x, y: p.y - a.y };
    
    const ab2 = ab.x * ab.x + ab.y * ab.y;
    if (ab2 === 0) return { distance: Math.sqrt(ap.x**2 + ap.y**2), t: 0 };
    
    let t = (ap.x * ab.x + ap.y * ab.y) / ab2;
    const tSeg = Math.max(0, Math.min(1, t));
    
    const closest = { x: a.x + tSeg * ab.x, y: a.y + tSeg * ab.y };
    const dist = Math.sqrt((p.x - closest.x)**2 + (p.y - closest.y)**2);
    
    return { distance: dist, t: t };
};

// Map projection across a list of points (a polyline)
// Returns best { distance, t (0.0 - 1.0 overall) }
const getPolylineProjection = (lng, lat, points) => {
    let bestProj = { distance: 9999, t: 0 };
    if (!points || points.length < 2) return bestProj;

    let totalLength = 0;
    const segmentLengths = [];

    // 1st pass: Calculate sizes
    for (let i = 0; i < points.length - 1; i++) {
        const len = calculateDistance(points[i].lat, points[i].lng, points[i+1].lat, points[i+1].lng);
        segmentLengths.push(len);
        totalLength += len;
    }

    let currentLength = 0;
    // 2nd pass: Find closest segment
    for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i+1];
        const segLen = segmentLengths[i];

        const proj = getSegmentProjection(lng, lat, p1, p2);
        
        if (segLen > 0) {
            // Project into absolute global 't' percentage of total km
            const clampedT = Math.max(0, Math.min(1, proj.t));
            const absoluteT_km = currentLength + (clampedT * segLen);
            const globalT = totalLength > 0 ? absoluteT_km / totalLength : 0;
            
            if (proj.distance < bestProj.distance) {
                bestProj = { distance: proj.distance, t: globalT };
            }
        }
        currentLength += segLen;
    }
    return bestProj;
};

// GET - Search trips by location or get all trips
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const dropLat = searchParams.get("dropLat") || searchParams.get("lat");
    const dropLng = searchParams.get("dropLng") || searchParams.get("lng");
    const pickupLat = searchParams.get("pickupLat");
    const pickupLng = searchParams.get("pickupLng");
    const maxDistanceSearch = parseFloat(searchParams.get("maxDistance")) || 50;

    // If no location params, return all trips
    if (!dropLat || !dropLng) {
      const trips = await Trip.find({ 
        status: "scheduled" 
      })
      .populate("driver", "name isDriverVerified")
      .sort({ date: 1 });
      
      return NextResponse.json(trips, { status: 200 });
    }

    const dLat = parseFloat(dropLat);
    const dLng = parseFloat(dropLng);
    const pLat = pickupLat ? parseFloat(pickupLat) : null;
    const pLng = pickupLng ? parseFloat(pickupLng) : null;



    // Phase 3: We rely exclusively on the application-layer getPolylineProjection math 
    // to map routes rather than a strict $near Mongo constraint. This natively supports 
    // legacy trips that were made before the 2dsphere index was instituted!
    const query = {
      sourceCoords: { $exists: true },
      destinationCoords: { $exists: true },
      status: "scheduled"
    };

    // Get active trip cohort
    const allTrips = await Trip.find(query).populate("driver", "name isDriverVerified rating reviewsCount");



    if (allTrips.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // Filter and score trips
    const tripsWithScore = allTrips.map(trip => {
      let score = 0; // Higher is better
      let isValid = false;
      let minDistanceToRoute = 999;
      let dynamicPrice = trip.pricePerSeat || Math.max(50, Math.floor((trip.distance || 10) * 4.5));

      // Reconstruct full route array
      const routePoints = [
         trip.sourceCoords,
         ...(trip.routeWaypoints || []),
         trip.destinationCoords
      ];

      const dropProj = getPolylineProjection(dLng, dLat, routePoints);
      minDistanceToRoute = dropProj.distance;

      if (pLat && pLng) {
        const pickProj = getPolylineProjection(pLng, pLat, routePoints);
        minDistanceToRoute = Math.min(pickProj.distance, dropProj.distance);

        // 1. Driver must pass within 1km of the pickup location
        // 2. The pickup point MUST be along the route, before the car hits its end segment (pickProj.t <= 1.0)
        if (pickProj.distance <= 1 && pickProj.t >= -0.1 && pickProj.t <= 1.0) {
            
            // Driver must be going towards the dropoff (dropoff t > pickup t)
            if (dropProj.t > pickProj.t) { 
                isValid = true;
                
                // 🤖 Phase 3.5: AI Sub-Segment Pricing Discount
                // The global 't' parameter gives the exact percentage (0.0 - 1.0) along the polyline.
                // Subtracting dropoff% from pickup% generates the true scalar ratio of how much of the trip the Rider is using!
                const routePercentage = Math.max(0.1, Math.min(1.0, dropProj.t - Math.max(0, pickProj.t)));
                
                // Original driver's cross-country price
                const fullRoutePrice = trip.pricePerSeat || Math.max(50, Math.floor((trip.distance || 10) * 4.5));
                
                // Discount the price linearly based on distance ridden + ₹10 flat connection boundary
                dynamicPrice = Math.floor((fullRoutePrice * routePercentage) + 10);
                dynamicPrice = Math.max(25, dynamicPrice); // Enforce ₹25 system absolute minimum
                
                // If dropoff is before or at the driver's final destination
                if (dropProj.distance <= 1 && dropProj.t <= 1.05) {
                    score = 100 - (pickProj.distance + dropProj.distance); // Perfect match
                } else {
                    // Driver's final station is before the Rider's destination OR route diverges
                    // Show these trips below (at bottom)
                    score = 10 - pickProj.distance; 
                }
            }
        }
      } else {
        // Fallback if no pickup provided: just check if destination is near the route
        if (dropProj.distance <= 1) { // 1km contact
           isValid = true;
           score = 50 - dropProj.distance;
        }
      }

      return {
        ...trip.toObject(),
        matchScore: score,
        distanceFromRoute: minDistanceToRoute,
        pricePerSeat: dynamicPrice, // Override static DB price with dynamically discounted intersection price!
        isValid
      };
    }).filter(trip => trip.isValid);



    // Sort by score descending
    tripsWithScore.sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json(tripsWithScore, { status: 200 });
  } catch (error) {
    console.error("❌ Search error:", error);
    return NextResponse.json(
      { msg: "Error searching trips", error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new trip (protected)
export async function POST(request) {
  try {
    // Check authentication
    const { authenticated, userId } = await requireAuth();
    
    if (!authenticated) {
      return NextResponse.json(
        { msg: "Not authorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const { vehicleId, vehicleType, seats, mileage, source, destination, date, distance, duration, sourceCoords, destinationCoords, routeWaypoints } = await request.json();

    if (!vehicleType || !seats || !mileage || !source || !destination || !date) {
      return NextResponse.json(
        { msg: "All fields are required" },
        { status: 400 }
      );
    }

    // Professional rule: driver can only create one trip at a time, or must have a much larger time gap
    const activeOrScheduledTrips = await Trip.find({
      driver: userId,
      status: { $in: ["scheduled", "in-progress"] }
    });

    if (activeOrScheduledTrips.length > 0) {
      const newTripDate = new Date(date);
      for (let t of activeOrScheduledTrips) {
        if (!t.date) continue;
        const existingTripDate = new Date(t.date);
        const diffHours = Math.abs(newTripDate - existingTripDate) / (1000 * 60 * 60);

        if (diffHours < 6) {
          return NextResponse.json(
            { msg: "You have an active or scheduled trip too close to this time. Please complete your current trip first or schedule with at least a 6-hour gap." },
            { status: 400 }
          );
        }
      }
    }

    // 🤖 Phase 3: AI Smart Pricing Algorithm
    // Evaluates route payload bounding ratio against average platform rates
    // Base cost: ₹4 per kilometer distance + ₹20 base fare, discounted slightly by vehicle seat width economy format
    const baselineRatePerKm = 4.5;
    const computedPricePerSeat = Math.max(30, Math.floor((distance * baselineRatePerKm) / (seats > 3 ? 1.2 : 1)));

    const trip = new Trip({
      driver: userId,
      vehicleId,
      vehicleType,
      seats,
      mileage,
      source,
      destination,
      date,
      distance,
      pricePerSeat: computedPricePerSeat,
      duration,
      sourceCoords,
      destinationCoords,
      sourcePoint: { type: 'Point', coordinates: [sourceCoords.lng, sourceCoords.lat] },
      destinationPoint: { type: 'Point', coordinates: [destinationCoords.lng, destinationCoords.lat] },
      routeWaypoints
    });

    // Enforce 20-trip limit per driver
    const driverTripCount = await Trip.countDocuments({ driver: userId });
    if (driverTripCount >= 20) {
      const oldestTrips = await Trip.find({ driver: userId })
        .sort({ createdAt: 1 })
        .limit(driverTripCount - 19); // Keep last 19, so new one makes 20
      
      const tripIdsToDelete = oldestTrips.map(t => t._id);
      await Trip.deleteMany({ _id: { $in: tripIdsToDelete } });

    }

    await trip.save();
    
    revalidatePath("/", "layout");
    
    return NextResponse.json(
      { msg: "Trip created successfully", trip },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create trip error:", error);
    return NextResponse.json(
      { msg: error.message || "Server error" },
      { status: 500 }
    );
  }
}
