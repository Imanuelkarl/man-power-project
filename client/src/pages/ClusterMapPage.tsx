// pages/ClusterMapPage.tsx
//
// Map view for ONE saved cluster (or "all clusters" overview). This is no
// longer the landing view — ClusterHubPage renders the cluster list/creation
// UI first, and only mounts this when the person taps "View on map" on a
// specific cluster, or "View all on map".
//
// ASSUMPTIONS (adjust if your real setup differs):
// - Requires `npm i @react-google-maps/api` and `VITE_GOOGLE_MAPS_API_KEY`.

import { useEffect, useMemo, useRef, useState } from "react";
import { GoogleMap, OverlayView, Polygon, Circle, useJsApiLoader } from "@react-google-maps/api";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { MapPin, ArrowLeft, Satellite, Map as MapIcon, Zap } from "lucide-react";
import { formatNaira } from "../lib/format";
import { PowerLevelBadge } from "../components/cluster/cluster-widgets";
import { footprintFor } from "../lib/geo-hull";
import type { ClusterWithStats, EnrichedManufacturer } from "../types/cluster.types";

const NIGERIA_CENTER = { lat: 9.082, lng: 8.6753 };
const MAP_CONTAINER_STYLE = { width: "100%", height: "100%" };

const POWER_COLOR: Record<string, string> = {
  high: "oklch(0.65 0.21 25)",
  medium: "oklch(0.78 0.15 75)",
  low: "oklch(0.68 0.16 150)",
};

const MAP_OPTIONS: google.maps.MapOptions = {
  disableDefaultUI: false,
  streetViewControl: false,
  fullscreenControl: true,
  mapTypeControl: false,
  clickableIcons: false,
  styles: [
    { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
    { featureType: "transit", stylers: [{ visibility: "off" }] },
  ],
};

interface ClusterMapPageProps {
  /** The cluster to focus on. Pass `null` to show every cluster's companies at once. */
  cluster: ClusterWithStats | null;
  allClusters: ClusterWithStats[];
  enriched: EnrichedManufacturer[];
  avgSpendByManufacturer: Map<number, number>;
  onBack: () => void;
}

export const ClusterMapPage: React.FC<ClusterMapPageProps> = ({
  cluster,
  allClusters,
  enriched,
  avgSpendByManufacturer,
  onBack,
}) => {
  const [mapType, setMapType] = useState<"roadmap" | "satellite">("roadmap");
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: "cluster-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
  });

  // Members to plot: the selected cluster's companies, or everyone who
  // belongs to at least one cluster when no single cluster is selected.
  const memberIds = useMemo(() => {
    if (cluster) return new Set(cluster.manufacturerIds);
    return new Set(allClusters.flatMap((c) => c.manufacturerIds));
  }, [cluster, allClusters]);

  const idToLevel = useMemo(() => {
    const map = new Map<number, string>();
    if (cluster) {
      cluster.manufacturerIds.forEach((id) => map.set(id, cluster.powerLevel));
    } else {
      allClusters.forEach((c) => c.manufacturerIds.forEach((id) => map.set(id, c.powerLevel)));
    }
    return map;
  }, [cluster, allClusters]);

  const points = useMemo(
    () => enriched.filter((m) => memberIds.has(m.id)),
    [enriched, memberIds],
  );

  // One footprint (hull polygon, or circle for 1-2 companies) per cluster
  // shown — this is the shaded region around a cluster's companies.
  const footprints = useMemo(() => {
    const source = cluster ? [cluster] : allClusters;
    return source
      .map((c) => {
        const members = enriched.filter((m) => c.manufacturerIds.includes(m.id));
        if (members.length === 0) return null;
        return {
          id: c.id,
          level: c.powerLevel,
          shape: footprintFor(members.map((m) => ({ lat: m.lat, lng: m.lng }))),
        };
      })
      .filter((f): f is NonNullable<typeof f> => f !== null);
  }, [cluster, allClusters, enriched]);

  useEffect(() => {
    if (!isLoaded || !mapRef.current || points.length === 0) return;
    const bounds = new google.maps.LatLngBounds();
    points.forEach((p) => bounds.extend({ lat: p.lat, lng: p.lng }));
    mapRef.current.fitBounds(bounds, 48);
  }, [isLoaded, points]);

  const hovered = points.find((p) => p.id === hoveredId) ?? null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <Button size="sm" variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to clusters
          </Button>
          <div>
            <h2 className="font-display font-semibold text-base">
              {cluster ? cluster.name : "All clusters"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {points.length} companies plotted
              {cluster ? ` · ${cluster.geoType} cluster` : ""}
            </p>
          </div>
          {cluster && <PowerLevelBadge level={cluster.powerLevel} />}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={mapType === "roadmap" ? "default" : "outline"}
            size="sm"
            onClick={() => setMapType("roadmap")}
          >
            <MapIcon className="w-4 h-4 mr-2" /> Map
          </Button>
          <Button
            variant={mapType === "satellite" ? "default" : "outline"}
            size="sm"
            onClick={() => setMapType("satellite")}
          >
            <Satellite className="w-4 h-4 mr-2" /> Satellite
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden relative" style={{ height: 640 }}>
        {!isLoaded ? (
          <div className="h-full grid place-items-center text-sm text-muted-foreground">
            Loading map…
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={MAP_CONTAINER_STYLE}
            center={NIGERIA_CENTER}
            zoom={6}
            mapTypeId={mapType}
            options={MAP_OPTIONS}
            onLoad={(map) => {
              mapRef.current = map;
            }}
          >
            {footprints.map((f) => {
              const color = POWER_COLOR[f.level] ?? POWER_COLOR.medium;
              if (f.shape.kind === "polygon") {
                return (
                  <Polygon
                    key={f.id}
                    paths={f.shape.path}
                    options={{
                      fillColor: color,
                      fillOpacity: cluster ? 0.22 : 0.14,
                      strokeColor: color,
                      strokeOpacity: 0.9,
                      strokeWeight: 2,
                    }}
                  />
                );
              }
              return (
                <Circle
                  key={f.id}
                  center={f.shape.center}
                  radius={f.shape.radiusKm * 1000}
                  options={{
                    fillColor: color,
                    fillOpacity: cluster ? 0.18 : 0.11,
                    strokeColor: color,
                    strokeOpacity: 0.8,
                    strokeWeight: 1.5,
                  }}
                />
              );
            })}

            {points.map((m) => {
              const color = POWER_COLOR[idToLevel.get(m.id) ?? "medium"];
              return (
                <OverlayView
                  key={m.id}
                  position={{ lat: m.lat, lng: m.lng }}
                  mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                >
                  <div
                    onMouseEnter={() => setHoveredId(m.id)}
                    onMouseLeave={() => setHoveredId((id) => (id === m.id ? null : id))}
                    style={{ transform: "translate(-50%, -100%)", cursor: "pointer" }}
                  >
                    <MapPin
                      className="drop-shadow"
                      width={hoveredId === m.id ? 26 : 20}
                      height={hoveredId === m.id ? 26 : 20}
                      style={{
                        color,
                        fill: color,
                        fillOpacity: 0.25,
                        transition: "all 120ms ease",
                      }}
                    />
                  </div>
                </OverlayView>
              );
            })}

            {hovered && (
              <OverlayView
                position={{ lat: hovered.lat, lng: hovered.lng }}
                mapPaneName={OverlayView.FLOAT_PANE}
              >
                <div style={{ transform: "translate(-50%, -140%)" }}>
                  <Card className="px-3 py-2 shadow-lg border min-w-[180px] pointer-events-none">
                    <div className="font-medium text-sm truncate">{hovered.company}</div>
                    <div className="text-xs text-muted-foreground">
                      {hovered.state} · {hovered.sectoralGroup}
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-xs font-mono">
                      <Zap className="w-3 h-3 text-energy" />
                      {formatNaira(avgSpendByManufacturer.get(hovered.id) ?? 0)} avg/period
                    </div>
                  </Card>
                </div>
              </OverlayView>
            )}
          </GoogleMap>
        )}
      </Card>

      {!cluster && (
        <p className="text-xs text-muted-foreground">
          Showing companies from every saved cluster, colored by that cluster's power level.
          Pick a single cluster from the hub to focus the map on it.
        </p>
      )}
    </div>
  );
};