import * as turf from "@turf/turf";
import type { EnrichedManufacturer } from "../types/cluster.types";
//import type { Manufacturer } from "../types/manufacturer.types";

let geoJSON: { features: any[] } | null = null;
let loadingPromise: Promise<any> | null = null;


/**
 * Loads the GeoJSON only once.
 */
export async function loadGeoJSON() {
  if (geoJSON) return geoJSON;

  if (!loadingPromise) {
    loadingPromise = fetch("/geo/nga_admin2.geojson")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load GeoJSON");
        }
        return res.json();
      })
      .then((data) => {
        geoJSON = data;
        console.log(`Loaded ${geoJSON?.features.length} features.`);

        return geoJSON;
      });
  }

  return loadingPromise;
}

/**
 * Find the State and LGA containing the given coordinates.
 *
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<{state: string, lga: string} | null>}
 */
export async function findLGA(latitude: number, longitude: number) {
  const data = await loadGeoJSON();
  console.log("Finding LGA...");

  const point = turf.point([longitude, latitude]);

  for (const feature of data.features) {
    // Some GeoJSON files may wrap geometry differently; prefer the geometry object
    const geom = feature && (feature.geometry || feature);

    // Skip invalid features
    if (!geom || !geom.type) continue;
    console.log("Trying to find");
    // Ensure we test against a polygon/multipolygon feature
    try {
      if (turf.booleanPointInPolygon(point, geom as any)) {
        console.log("Found State");
        return {
          state: feature.properties?.adm1_name,
          lga: feature.properties?.adm2_name,
          properties: feature.properties,
        };
      } else {
      }
    } catch (err) {
      // If the geometry type is unsupported, skip
      console.warn("Skipping feature due to geometry error:", err);
      continue;
    }
  }

  return null;
}

// Helper to extract coordinates from a company object
function getCompanyCoords(company: any): { lat: number; lng: number } | null {
  if (company == null) return null;
  if (
    typeof company.latitude === "number" &&
    typeof company.longitude === "number"
  ) {
    return { lat: company.latitude, lng: company.longitude };
  }
  if (typeof company.lat === "number" && typeof company.lng === "number") {
    return { lat: company.lat, lng: company.lng };
  }
  if (
    company.location &&
    typeof company.location.lat === "number" &&
    typeof company.location.lng === "number"
  ) {
    return { lat: company.location.lat, lng: company.location.lng };
  }
  return null;
}

/**
 * Filter companies that fall within a given LGA name.
 */
export async function filterCompaniesByLGA(lgaName: string, companies: any[]) {
  const data = await loadGeoJSON();
  const result: any[] = [];
  const target = (lgaName || "").toLowerCase();
  for (const company of companies) {
    const coords = getCompanyCoords(company);
    if (!coords) continue;
    const point = turf.point([coords.lng, coords.lat]);
    for (const feature of data.features) {
      const name = (feature.properties?.adm2_name || "").toLowerCase();
      if (name !== target) continue;
      try {
        if (turf.booleanPointInPolygon(point, feature.geometry || feature)) {
          result.push(company);
          break;
        }
      } catch (_) {
        continue;
      }
    }
  }
  return result;
}

export function existInLGA(lgaName: string, company: EnrichedManufacturer) {
  const data = geoJSON;//loadGeoJSON();
  if(!data) return;
  const target =lgaName.split("::")[1]? (lgaName.split("::")[1]).toLowerCase():(lgaName || "").toLowerCase();
  
  const coords = getCompanyCoords(company);
  if (!coords) return;
  const point = turf.point([coords.lng, coords.lat]);
  for (const feature of data.features) {
    const name = (feature.properties?.adm2_name || "").toLowerCase();
    console.log("Finding state");
    if (name !== target) continue;
    try {
      if (turf.booleanPointInPolygon(point, feature.geometry || feature)) {
        console.log("found missing lga as ",feature.properties?.adm2_name);
        return true
      }
    } catch (_) {
      continue;
      
    }

  }
  return false;
}

/**
 * Filter companies that fall within a given State name.
 */
export async function filterCompaniesByState(
  stateName: string,
  companies: any[],
) {
  const data = await loadGeoJSON();
  const result: any[] = [];
  const target = (stateName || "").toLowerCase();
  for (const company of companies) {
    const coords = getCompanyCoords(company);
    if (!coords) continue;
    const point = turf.point([coords.lng, coords.lat]);
    for (const feature of data.features) {
      const name = (feature.properties?.adm1_name || "").toLowerCase();
      if (name !== target) continue;
      try {
        if (turf.booleanPointInPolygon(point, feature.geometry || feature)) {
          result.push(company);
          break;
        }
      } catch (_) {
        continue;
      }
    }
  }
  return result;
}
