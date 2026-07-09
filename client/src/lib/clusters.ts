import * as turf from "@turf/turf";
import type { Manufacturer } from "./store";

export interface Cluster {
  id: number;
  members: Manufacturer[];
  centroid: [number, number]; // [lng, lat]
  polygon: Array<[number, number]>; // ring of [lng, lat] (may be a small buffered circle for tiny clusters)
}

// Simple DBSCAN grouping using turf.clustersDbscan.
// maxDistanceKm ~ 60 groups nearby industrial cities.
export function clusterManufacturers(
  manufacturers: Manufacturer[],
  maxDistanceKm = 60,
  minPoints = 2
): Cluster[] {
  if (manufacturers.length === 0) return [];

  const fc = turf.featureCollection(
    manufacturers.map((m) => turf.point([m.lng, m.lat], { id: m.id }))
  );
  const clustered = turf.clustersDbscan(fc, maxDistanceKm, { minPoints });

  const groups = new Map<number, Manufacturer[]>();
  clustered.features.forEach((f, idx) => {
    const cid = (f.properties as any).cluster;
    if (cid === undefined) return; // noise
    const arr = groups.get(cid) ?? [];
    arr.push(manufacturers[idx]);
    groups.set(cid, arr);
  });

  const result: Cluster[] = [];
  let id = 0;
  for (const members of groups.values()) {
    if (members.length < 2) continue;
    const points = turf.featureCollection(members.map((m) => turf.point([m.lng, m.lat])));
    const centroidFeat = turf.centroid(points);
    const centroid = centroidFeat.geometry.coordinates as [number, number];

    let polygon: Array<[number, number]>;
    if (members.length >= 3) {
      const hull = turf.convex(points, { concavity: 2 });
      if (hull) {
        const buffered = turf.buffer(hull, 5, { units: "kilometers" });
        polygon = ((buffered?.geometry.coordinates?.[0] ?? hull.geometry.coordinates[0]) as [number, number][]);
      } else {
        const circle = turf.circle(centroid, 20, { steps: 32, units: "kilometers" });
        polygon = circle.geometry.coordinates[0] as [number, number][];
      }
    } else {
      const circle = turf.circle(centroid, 25, { steps: 32, units: "kilometers" });
      polygon = circle.geometry.coordinates[0] as [number, number][];
    }

    result.push({ id: id++, members, centroid, polygon });
  }

  return result;
}