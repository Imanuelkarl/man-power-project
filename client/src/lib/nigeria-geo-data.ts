// lib/nigeria-geo-data.ts
//
// Official Nigeria geography, used to populate the cluster-creation pickers.
//
// DATA SOURCE: `./data/nigeria-geo.json` — replace that file's contents with
// your full state/LGA/ward export (same shape: an array of
// { state, lgas: [{ lga, wards: string[] }] }). Right now it only has one
// state (Abia) as a placeholder so the app has something to render; nothing
// else in this file needs to change once you drop in the full dataset.
// (Requires `resolveJsonModule` in tsconfig — on by default in Vite/CRA.)
//
// The 6 geopolitical zones ("regions") and the state -> region mapping below
// are static and accurate and don't depend on the JSON file.

// lib/nigeria-geo-data.ts
//
// Official Nigeria geography, used to populate the cluster-creation pickers.
import  nigeriaGeoJson from '../data/data.json' with { type: 'json' };


export const NIGERIA_REGIONS = [
  "North Central",
  "North East",
  "North West",
  "South East",
  "South South",
  "South West",
] as const;

export type NigeriaRegion = (typeof NIGERIA_REGIONS)[number];

export const STATE_TO_REGION: Record<string, NigeriaRegion> = {
  "Benue": "North Central",
  "Kogi": "North Central",
  "Kwara": "North Central",
  "Nasarawa": "North Central",
  "Niger": "North Central",
  "Plateau": "North Central",
  "FCT": "North Central",
  "Abuja": "North Central", // alias some datasets use instead of "FCT"

  "Adamawa": "North East",
  "Bauchi": "North East",
  "Borno": "North East",
  "Gombe": "North East",
  "Taraba": "North East",
  "Yobe": "North East",

  "Jigawa": "North West",
  "Kaduna": "North West",
  "Kano": "North West",
  "Katsina": "North West",
  "Kebbi": "North West",
  "Sokoto": "North West",
  "Zamfara": "North West",

  "Abia": "South East",
  "Anambra": "South East",
  "Ebonyi": "South East",
  "Enugu": "South East",
  "Imo": "South East",

  "Akwa Ibom": "South South",
  "Bayelsa": "South South",
  "Cross River": "South South",
  "Delta": "South South",
  "Edo": "South South",
  "Rivers": "South South",

  "Ekiti": "South West",
  "Lagos": "South West",
  "Ogun": "South West",
  "Ondo": "South West",
  "Osun": "South West",
  "Oyo": "South West",
};

export function regionForState(state: string): string {
  return STATE_TO_REGION[state?.trim()] ?? "Unassigned";
}

// ---------------------------------------------------------------------------
// Raw dataset shape + typed access
// ---------------------------------------------------------------------------

export interface NigeriaLgaData {
  lga: string;
  wards: string[];
}

export interface NigeriaStateData {
  state: string;
  lgas: NigeriaLgaData[];
}

const GEO_DATA = nigeriaGeoJson as NigeriaStateData[];

const stateIndex = new Map<string, NigeriaStateData>(
  GEO_DATA.map((s) => [s.state.trim().toLowerCase(), s]),
);

export function getAllStates(): string[] {
  return GEO_DATA.map((s) => s.state).sort();
}

export function getLgasForState(state: string): string[] {
  const entry = stateIndex.get(state?.trim().toLowerCase());
  return entry ? entry.lgas.map((l) => l.lga).sort() : [];
}

export function getWardsForStateLga(state: string, lga: string): string[] {
  const entry = stateIndex.get(state?.trim().toLowerCase());
  const lgaEntry = entry?.lgas.find((l) => l.lga.trim().toLowerCase() === lga?.trim().toLowerCase());
  return lgaEntry ? [...lgaEntry.wards].sort() : [];
}

/** Case-insensitive check used to match a manufacturer's free-text `city` to an official LGA name. */
export function findOfficialLga(state: string, cityGuess: string): string | null {
  const entry = stateIndex.get(state?.trim().toLowerCase());
  if (!entry) return null;
  const match = entry.lgas.find((l) => l.lga.trim().toLowerCase() === cityGuess?.trim().toLowerCase());
  return match ? match.lga : null;
}

export function lgaKey(state: string, lga: string): string {
  return `${state}::${lga}`;
}

export function wardKey(state: string, lga: string, ward: string): string {
  return `${state}::${lga}::${ward}`;
}