// lib/cluster-utils.ts
//
// Everything needed to turn a saved ClusterDefinition into live stats, plus
// a temporary "store" for persisting clusters.
//
// ON PERSISTENCE: there's no cluster endpoint on the backend yet, so
// `clusterStore` below reads/writes localStorage and returns Promises, so
// every call site already looks like it's hitting an API. When the real
// endpoint exists, swap the bodies of getClusters/saveCluster/deleteCluster
// for `fetch("/api/clusters", ...)` calls — nothing else in the UI needs to
// change.

import type { Manufacturer } from "../types/manufacturer.types";
import type {
  ClusterDefinition,
  ClusterWithStats,
  EnrichedManufacturer,
  PowerUsageLevel,
} from "../types/cluster.types";
import { findOfficialLga, lgaKey, regionForState } from "./nigeria-geo-data";
import { distanceKm } from "./geo-hull";
import { existInLGA } from "./location_finder";

// ---------------------------------------------------------------------------
// Enrichment
// ---------------------------------------------------------------------------

/**
 * `lga` is only set when `city` matches an official LGA name for that state
 * (case-insensitive). Non-matches still get plotted on the map fine — they
 * just won't resolve into LGA/ward-scoped clusters until the backend gives
 * companies a real LGA/ward field. State, region and radius clusters are
 * unaffected by this and always resolve correctly.
 */

export function enrichManufacturers(
  manufacturers: Manufacturer[],
): EnrichedManufacturer[] {
  return manufacturers
    .filter((m) => typeof m.lat === "number" && typeof m.lng === "number")
    .map((m) => {
      const state = m.state?.trim() || "Unknown";
      const city = m.city?.trim() || "";
      const officialLga = city ? findOfficialLga(state, city) : null;
      return {
        id: m.id,
        company: m.name,
        state,
        region: regionForState(state),
        lga: officialLga ? lgaKey(state, officialLga) : "",
        ward: "", // no per-company ward data exists yet
        lat: m.lat,
        lng: m.lng,
        sectoralGroup: m.sectoral_group,
      };
    });
}

// ---------------------------------------------------------------------------
// Membership resolution
// ---------------------------------------------------------------------------

/** Which manufacturer ids match a cluster definition, right now. */
export function resolveMembers(
  def: Pick<
    ClusterDefinition,
    | "regions"
    | "states"
    | "lgas"
    | "wards"
    | "manufacturerIds"
    | "focalPoint"
    | "radiusKm"
  >,
  enriched: EnrichedManufacturer[],
): number[] {
  const regions = new Set(def.regions);
  const states = new Set(def.states);
  const wards = new Set(def.wards);
  const manual = new Set(def.manufacturerIds);

  const useRadius =
    !!def.focalPoint &&
    typeof def.radiusKm === "number" &&
    def.radiusKm > 0;

  const matched = new Set<number>();

  for (const m of enriched) {
    let inLga = false;

    
      for (const lga of def.lgas) {
        if (existInLGA(lga, m)) {
          inLga = true;
          break;
        }
      }
    

    if (
      regions.has(m.region) ||
      states.has(m.state) ||
      inLga ||
      (m.ward && wards.has(m.ward)) ||
      manual.has(m.id)
    ) {
      matched.add(m.id);
    }

    if (
      useRadius &&
      distanceKm(def.focalPoint!, { lat: m.lat, lng: m.lng }) <= def.radiusKm!
    ) {
      matched.add(m.id);
    }
  }

  return [...matched];
}
// ---------------------------------------------------------------------------
// Energy metrics
// ---------------------------------------------------------------------------

/** Avg Naira spend per period, per manufacturer. */
export function computeAvgSpendByManufacturer(
  questionnaires: any[],
): Map<number, number> {
  const totals = new Map<number, { sum: number; count: number }>();
  questionnaires.forEach((q) => {
    const spend =
      (q.energyDiesel ?? 0) +
      (q.energyGas ?? 0) +
      (q.energyGenerator ?? 0) +
      (q.energyOther ?? 0);
    const id = Number(q.manufacturerId);
    const entry = totals.get(id) ?? { sum: 0, count: 0 };
    entry.sum += spend;
    entry.count += 1;
    totals.set(id, entry);
  });
  const result = new Map<number, number>();
  totals.forEach((v, k) => result.set(k, v.count ? v.sum / v.count : 0));
  return result;
}

/** Avg kWh consumed per period, per manufacturer. */
export function computeAvgEnergyByManufacturer(
  questionnaires: any[],
): Map<number, number> {
  const totals = new Map<number, { sum: number; count: number }>();
  questionnaires.forEach((q) => {
    const consumed =
      q.totalEnergyConsumed ??
      (q.energyGeneratedByGas ?? 0) +
        (q.energyGeneratedByDiesel ?? 0) +
        (q.energyGeneratedByGenerator ?? 0) +
        (q.energyGeneratedByOther ?? 0);
    const id = Number(q.manufacturerId);
    const entry = totals.get(id) ?? { sum: 0, count: 0 };
    entry.sum += consumed;
    entry.count += 1;
    totals.set(id, entry);
  });
  const result = new Map<number, number>();
  totals.forEach((v, k) => result.set(k, v.count ? v.sum / v.count : 0));
  return result;
}

/**
 * High/medium/low is relative to the clusters you've actually created, not
 * a fixed kWh number: sort clusters by total energy consumed and split them
 * into three equal-sized groups — bottom third is "low", middle third
 * "medium", top third "high". Re-run whenever the cluster list changes so
 * the labels stay relative to the current data.
 */
export function assignPowerLevels<
  T extends { id: string; totalEnergyConsumedKwh: number },
>(clusters: T[]): (T & { powerLevel: PowerUsageLevel })[] {
  if (clusters.length <= 1) {
    return clusters.map((c) => ({
      ...c,
      powerLevel: "medium" as PowerUsageLevel,
    }));
  }

  const sorted = [...clusters].sort(
    (a, b) => a.totalEnergyConsumedKwh - b.totalEnergyConsumedKwh,
  );
  const n = sorted.length;
  const lowCut = Math.floor(n / 3);
  const highCut = Math.floor((2 * n) / 3);

  const levelById = new Map<string, PowerUsageLevel>();
  sorted.forEach((c, i) => {
    const level: PowerUsageLevel =
      i >= highCut ? "high" : i >= lowCut ? "medium" : "low";
    levelById.set(c.id, level);
  });

  return clusters.map((c) => ({ ...c, powerLevel: levelById.get(c.id)! }));
}

// ---------------------------------------------------------------------------
// Cluster -> stats
// ---------------------------------------------------------------------------

/**
 * Resolves a definition's stats (membership, totals). Power level is NOT
 * set here — it depends on how this cluster compares to every other saved
 * cluster, so call `assignPowerLevels` on the full list afterwards.
 */
export function buildClusterWithStats(
  def: ClusterDefinition,
  enriched: EnrichedManufacturer[],
  spendByManufacturer: Map<number, number>,
  energyByManufacturer: Map<number, number>,
): Omit<ClusterWithStats, "powerLevel"> {
  const memberIds = resolveMembers(def, enriched);
  const members = enriched.filter((m) => memberIds.includes(m.id));

  const spends = memberIds.map((id) => spendByManufacturer.get(id) ?? 0);
  const energies = memberIds.map((id) => energyByManufacturer.get(id) ?? 0);

  const totalSpend = spends.reduce((s, v) => s + v, 0);
  const totalEnergy = energies.reduce((s, v) => s + v, 0);
  const avgSpend = memberIds.length ? totalSpend / memberIds.length : 0;
  const avgEnergy = memberIds.length ? totalEnergy / memberIds.length : 0;

  const stateCounts = new Map<string, number>();
  const regionCounts = new Map<string, number>();
  members.forEach((m) => {
    stateCounts.set(m.state, (stateCounts.get(m.state) ?? 0) + 1);
    regionCounts.set(m.region, (regionCounts.get(m.region) ?? 0) + 1);
  });
  const topStates = [...stateCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([s]) => s);
  const topRegions = [...regionCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([r]) => r);

  return {
    ...def,
    manufacturerIds: memberIds,
    manufacturerCount: memberIds.length,
    avgEnergySpendNaira: avgSpend,
    totalEnergySpendNaira: totalSpend,
    avgEnergyConsumedKwh: avgEnergy,
    totalEnergyConsumedKwh: totalEnergy,
    topStates,
    topRegions,
  };
}

// ---------------------------------------------------------------------------
// Temporary persistence (swap for a real API later — see file header)
// ---------------------------------------------------------------------------

const STORAGE_KEY = "test_clusters_v1";

function readRaw(): ClusterDefinition[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ClusterDefinition[]) : [];
  } catch {
    return [];
  }
}

function writeRaw(defs: ClusterDefinition[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defs));
}

export const clusterStore = {
  async getClusters(): Promise<ClusterDefinition[]> {
    // TODO: replace with `await api.get("/clusters")`
    return readRaw();
  },

  async saveCluster(def: ClusterDefinition): Promise<ClusterDefinition> {
    // TODO: replace with `await api.post("/clusters", def)` /
    // `await api.put(\`/clusters/${def.id}\`, def)` for updates
    const all = readRaw();
    const idx = all.findIndex((c) => c.id === def.id);
    if (idx >= 0) all[idx] = def;
    else all.push(def);
    writeRaw(all);
    return def;
  },

  async deleteCluster(id: string): Promise<void> {
    // TODO: replace with `await api.delete(\`/clusters/${id}\`)`
    writeRaw(readRaw().filter((c) => c.id !== id));
  },
};

export function newClusterId(): string {
  return `cluster_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
