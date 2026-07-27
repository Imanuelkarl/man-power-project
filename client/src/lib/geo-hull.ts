// lib/geo-hull.ts
//
// Plain-geometry helpers used to draw a shape around a cluster's companies
// on the map — a convex hull polygon for 3+ points, or a circle for 1-2.
// This mirrors what the old radius-based auto-clustering drew, just fed
// from a cluster's *resolved membership* instead of a proximity group.

export interface LatLng {
  lat: number;
  lng: number;
}

export function centroidOf(points: LatLng[]): LatLng {
  if (points.length === 0) return { lat: 0, lng: 0 };
  const sum = points.reduce(
    (acc, p) => ({ lat: acc.lat + p.lat, lng: acc.lng + p.lng }),
    { lat: 0, lng: 0 },
  );
  return { lat: sum.lat / points.length, lng: sum.lng / points.length };
}

/** Haversine distance in km. */
export function distanceKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Andrew's monotone chain convex hull. Treats lng as x, lat as y. */
export function convexHull(points: LatLng[]): LatLng[] {
  const pts = [...new Map(points.map((p) => [`${p.lat},${p.lng}`, p])).values()].sort(
    (a, b) => a.lng - b.lng || a.lat - b.lat,
  );
  if (pts.length < 3) return pts;

  const cross = (o: LatLng, a: LatLng, b: LatLng) =>
    (a.lng - o.lng) * (b.lat - o.lat) - (a.lat - o.lat) * (b.lng - o.lng);

  const lower: LatLng[] = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
      lower.pop();
    }
    lower.push(p);
  }

  const upper: LatLng[] = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
      upper.pop();
    }
    upper.push(p);
  }

  upper.pop();
  lower.pop();
  return [...lower, ...upper];
}

/**
 * A drawable footprint for a set of points: a hull polygon for 3+ distinct
 * points, otherwise a circle around the centroid sized to fit everything
 * with a bit of padding.
 */
export function footprintFor(
  points: LatLng[],
): { kind: "polygon"; path: LatLng[] } | { kind: "circle"; center: LatLng; radiusKm: number } {
  const centroid = centroidOf(points);
  const uniqueCount = new Set(points.map((p) => `${p.lat},${p.lng}`)).size;

  if (uniqueCount >= 3) {
    const hull = convexHull(points);
    if (hull.length >= 3) return { kind: "polygon", path: hull };
  }

  const maxDist = points.reduce((m, p) => Math.max(m, distanceKm(centroid, p)), 0);
  return { kind: "circle", center: centroid, radiusKm: Math.max(maxDist + 8, 12) };
}