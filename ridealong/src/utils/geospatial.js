export const getSegmentProjection = (lng, lat, source, dest) => {
    const avgLat = (lat + source.lat + dest.lat) / 3 * Math.PI / 180;
    const kx = 111.32 * Math.cos(avgLat); const ky = 111.32;
    const p = { x: lng * kx, y: lat * ky }; const a = { x: source.lng * kx, y: source.lat * ky }; const b = { x: dest.lng * kx, y: dest.lat * ky };
    const ab = { x: b.x - a.x, y: b.y - a.y }; const ap = { x: p.x - a.x, y: p.y - a.y };
    const ab2 = ab.x * ab.x + ab.y * ab.y;
    if (ab2 === 0) return { distance: Math.sqrt(ap.x**2 + ap.y**2), point: { lat: source.lat, lng: source.lng } };
    const t = Math.max(0, Math.min(1, (ap.x * ab.x + ap.y * ab.y) / ab2));
    const closest = { x: a.x + t * ab.x, y: a.y + t * ab.y };
    const dist = Math.sqrt((p.x - closest.x)**2 + (p.y - closest.y)**2);
    return { distance: dist, point: { lat: closest.y / ky, lng: closest.x / kx } };
};

export const getPolylineIntersection = (lat, lng, points) => {
    let best = { distance: 9999, point: null };
    if (!points || points.length < 2) return null;
    for (let i = 0; i < points.length - 1; i++) {
        const proj = getSegmentProjection(lng, lat, points[i], points[i+1]);
        if (proj.distance < best.distance) best = proj;
    }
    return best.point;
};
