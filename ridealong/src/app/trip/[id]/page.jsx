import TripClientPage from "@/components/trip/TripClientPage";

async function getTrip(id) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const res = await fetch(`${apiUrl}/api/trips/${id}`, { 
      cache: 'no-store' 
    });
    
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("Server-side trip fetch error:", err);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const trip = await getTrip(id);

  if (!trip) {
    return { title: "Trip Not Found | RideAlong" };
  }

  return {
    title: `${trip.pickupLocation} to ${trip.destinationLocation} | RideAlong`,
    description: `Join this verified ride leaving at ${new Date(trip.date).toLocaleDateString()} for only ₹${trip.pricePerSeat} per seat!`,
  };
}

export default async function Page({ params }) {
  const { id } = await params;
  const initialTrip = await getTrip(id);

  return (
    <TripClientPage initialTrip={initialTrip} id={id} />
  );
}
