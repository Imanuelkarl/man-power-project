// types/cluster.types.ts
//
// Domain types for the manual/custom cluster system.
// A cluster is no longer computed dynamically by proximity — it's an explicit
// definition (which regions/states/LGAs/wards it covers, or a hand-picked set
// of companies) that gets saved and re-used. Membership is *resolved* from
// that definition against the current manufacturer list, so it stays correct
// as companies are added.

export type ClusterGeoType = "region" | "state" | "lga" | "ward" | "radius" | "custom";

export type PowerUsageLevel = "high" | "medium" | "low";

export interface ClusterFocalPoint {
  lat: number;
  lng: number;
  /** Label shown in the UI — a manufacturer's name, or "Custom point" for a map click. */
  label: string;
}

/**
 * The saved/creatable shape of a cluster. Only the fields relevant to its
 * geoType are typically populated, EXCEPT "custom", which can mix any of
 * regions/states/lgas/wards/manufacturerIds together — that's how you merge
 * e.g. two states + a handful of LGAs from a third into one cluster.
 *
 * "radius" clusters ignore the geo fields entirely and instead match every
 * manufacturer within `radiusKm` of `focalPoint`.
 *
 * lgas and wards are stored as "State::LGA" / "State::LGA::Ward" so the same
 * LGA/ward name in two different states can't collide.
 */
export interface ClusterDefinition {
  id: string;
  name: string;
  description?: string;
  geoType: ClusterGeoType;
  regions: string[];
  states: string[];
  lgas: string[]; // "State::LGA"
  wards: string[]; // "State::LGA::Ward"
  manufacturerIds: number[]; // manual additions, mainly used by "custom"
  focalPoint?: ClusterFocalPoint; // used by "radius"
  radiusKm?: number; // used by "radius"
  createdAt: string;
  updatedAt: string;
}

/** What you get back after resolving a definition against live data. */
export interface ClusterWithStats extends ClusterDefinition {
  manufacturerIds: number[]; // resolved, de-duplicated members
  manufacturerCount: number;
  avgEnergySpendNaira: number; // avg (diesel+gas+generator+other) spend per period
  totalEnergySpendNaira: number;
  avgEnergyConsumedKwh: number; // avg totalEnergyConsumed per period
  totalEnergyConsumedKwh: number;
  powerLevel: PowerUsageLevel;
  topStates: string[]; // states represented, most companies first
  topRegions: string[];
}

export interface ClusterFilters {
  search: string;
  region: string | "all";
  state: string | "all";
  lga: string | "all"; // "State::LGA"
  geoType: ClusterGeoType | "all";
  powerLevel: PowerUsageLevel | "all";
}

export const DEFAULT_CLUSTER_FILTERS: ClusterFilters = {
  search: "",
  region: "all",
  state: "all",
  lga: "all",
  geoType: "all",
  powerLevel: "all",
};

/** A manufacturer enriched with the geo levels clusters are built from. */
export interface EnrichedManufacturer {
  id: number;
  company: string;
  state: string;
  region: string;
  lga: string; // "State::LGA" — only set when `city` matches an official LGA name
  ward: string; // always "" today — no per-company ward data exists yet
  lat: number;
  lng: number;
  sectoralGroup: string;
}