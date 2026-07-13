// lib/geo-clustering.ts
//
// Radius-based geographic clustering + convex-hull polygon generation.
// Pure functions, no map-library dependency, so they're easy to unit test.

export interface GeoPoint {
  id: string;
  lat: number;
  lng: number;
}

export interface GeoCluster<T extends GeoPoint = GeoPoint> {
  id: string;
  points: T[];
  centroid: { lat: number; lng: number };
  /** Convex hull outline, padded outward. Empty for singleton clusters (render a circle instead). */
  hull: { lat: number; lng: number }[];
  /** Radius in km to use if rendering a circle for a 1-2 point cluster. */
  radiusKm: number;
}

const EARTH_RADIUS_KM = 6371;

export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

function centroidOf(points: { lat: number; lng: number }[]): { lat: number; lng: number } {
  const n = points.length;
  return {
    lat: points.reduce((s, p) => s + p.lat, 0) / n,
    lng: points.reduce((s, p) => s + p.lng, 0) / n,
  };
}

/**
 * Greedy single-linkage radius clustering.
 * A company joins a cluster if it falls within `radiusKm` of that cluster's
 * running centroid. Deterministic given the input order (we sort by id first
 * so results are stable across re-renders).
 */
export function clusterByRadius<T extends GeoPoint>(points: T[], radiusKm: number): GeoCluster<T>[] {
  const remaining = [...points].sort((a, b) => a.id.localeCompare(b.id));
  const clusters: GeoCluster<T>[] = [];

  while (remaining.length) {
    const seed = remaining.shift()!;
    const members: T[] = [seed];
    let grew = true;

    while (grew) {
      grew = false;
      const centroid = centroidOf(members);
      for (let i = remaining.length - 1; i >= 0; i--) {
        if (haversineKm(centroid, remaining[i]) <= radiusKm) {
          members.push(remaining[i]);
          remaining.splice(i, 1);
          grew = true;
        }
      }
    }

    const centroid = centroidOf(members);
    clusters.push({
      id: `cluster-${clusters.length}-${seed.id}`,
      points: members,
      centroid,
      hull: members.length >= 3 ? padHull(convexHull(members), centroid, 1.25) : [],
      radiusKm,
    });
  }

  return clusters;
}

/** Graham scan convex hull. Returns points in the input's own {lat,lng} shape. */
function convexHull<T extends { lat: number; lng: number }>(pts: T[]): { lat: number; lng: number }[] {
  const unique = dedupe(pts);
  if (unique.length < 3) return unique.map((p) => ({ lat: p.lat, lng: p.lng }));

  const sorted = [...unique].sort((a, b) => (a.lng === b.lng ? a.lat - b.lat : a.lng - b.lng));
  const cross = (o: any, a: any, b: any) =>
    (a.lng - o.lng) * (b.lat - o.lat) - (a.lat - o.lat) * (b.lng - o.lng);

  const lower: any[] = [];
  for (const p of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper: any[] = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  upper.pop();
  lower.pop();
  return [...lower, ...upper].map((p) => ({ lat: p.lat, lng: p.lng }));
}

function dedupe<T extends { lat: number; lng: number }>(pts: T[]) {
  const seen = new Set<string>();
  return pts.filter((p) => {
    const k = `${p.lat.toFixed(6)},${p.lng.toFixed(6)}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/** Push each hull vertex outward from the centroid so the shading doesn't hug the markers exactly. */
function padHull(hull: { lat: number; lng: number }[], centroid: { lat: number; lng: number }, factor: number) {
  return hull.map((p) => ({
    lat: centroid.lat + (p.lat - centroid.lat) * factor,
    lng: centroid.lng + (p.lng - centroid.lng) * factor,
  }));
}