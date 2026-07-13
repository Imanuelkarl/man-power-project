// pages/ClusterMapPage.tsx
//
// ASSUMPTIONS (adjust if your real types differ):
// 1. `Manufacturer` has numeric `latitude` / `longitude` fields. If your store
//    uses `lat`/`lng` instead, just change the two lines marked ADJUST below.
// 2. `Questionnaire.manufacturerId` links back to Manufacturer.id, and the
//    energy fields are the same four used on the Dashboard
//    (energyDiesel, energyGas, energyGenerator, energyOther).
// 3. Requires `npm i @react-google-maps/api` and an API key exposed as
//    `VITE_GOOGLE_MAPS_API_KEY` (Maps JavaScript API enabled, no server key needed
//    for a client-only MVP — restrict it by HTTP referrer in the Google Cloud console).
//
// This file is self-contained and follows the same conventions as DashboardPage.tsx
// (useData(), Card/Badge/Button, oklch palette, formatNaira).

import { useMemo, useState, useCallback, useRef } from "react";
import { GoogleMap, Polygon, Circle, OverlayView, useJsApiLoader } from "@react-google-maps/api";
import { useData, type Manufacturer } from "../../lib/store";
import { clusterByRadius, type GeoPoint } from "../../lib/geo-clustering";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Slider } from "../../components/ui/slider";
import { MapPin, Layers, Satellite, Map as MapIcon, Zap, Building2 } from "lucide-react";
import { PageHeader } from "../../components/page-header";
import { formatNaira } from "../../lib/format";
// pages/ClusterMapPage.tsx
//
// ASSUMPTIONS (adjust if your real types differ):
// 1. `Questionnaire.manufacturerId` links back to Manufacturer.id, and the
//    energy fields are the same four used on the Dashboard
//    (energyDiesel, energyGas, energyGenerator, energyOther).
// 2. Requires `npm i @react-google-maps/api` and an API key exposed as
//    `VITE_GOOGLE_MAPS_API_KEY` (Maps JavaScript API enabled, no server key needed
//    for a client-only MVP — restrict it by HTTP referrer in the Google Cloud console).
//
// This file is self-contained and follows the same conventions as DashboardPage.tsx
// (useData(), Card/Badge/Button, oklch palette, formatNaira).


const CLUSTER_COLORS = [
  "oklch(0.68 0.16 150)",
  "oklch(0.78 0.15 75)",
  "oklch(0.65 0.18 240)",
  "oklch(0.7 0.19 20)",
  "oklch(0.7 0.17 300)",
  "oklch(0.72 0.15 190)",
  "oklch(0.66 0.19 40)",
];

const NIGERIA_CENTER = { lat: 9.082, lng: 8.6753 };

const MAP_CONTAINER_STYLE = { width: "100%", height: "100%" };

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

interface ManufacturerGeo extends GeoPoint {
  company: string;
  state: string;
  sectoralGroup: string;
}

export const ClusterMapPage: React.FC = () => {
  const { manufacturers, questionnaires } = useData();

  const [radiusKm, setRadiusKm] = useState(15);
  const [showPolygons, setShowPolygons] = useState(true);
  const [mapType, setMapType] = useState<"roadmap" | "satellite">("roadmap");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: "cluster-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
  });

  const geoManufacturers: ManufacturerGeo[] = useMemo(
    () =>
      manufacturers
        .filter((m: Manufacturer) => typeof m.lat === "number" && typeof m.lng === "number")
        .map((m: Manufacturer) => ({
          id: m.id,
          lat: m.lat,
          lng: m.lng,
          company: m.company,
          state: m.state,
          sectoralGroup: m.sectoralGroup,
        })),
    [manufacturers]
  );

  const clusters = useMemo(
    () => clusterByRadius(geoManufacturers, radiusKm),
    [geoManufacturers, radiusKm]
  );

  const clusterColorById = useMemo(() => {
    const map = new Map<string, string>();
    clusters.forEach((c, i) => map.set(c.id, CLUSTER_COLORS[i % CLUSTER_COLORS.length]));
    return map;
  }, [clusters]);

  const companyToCluster = useMemo(() => {
    const map = new Map<string, string>();
    clusters.forEach((c) => c.points.forEach((p) => map.set(p.id, c.id)));
    return map;
  }, [clusters]);

  // avg power usage (Naira spend) per manufacturer, from their questionnaire history
  const avgPowerByManufacturer = useMemo(() => {
    const totals = new Map<string, { sum: number; count: number }>();
    questionnaires.forEach((q: any) => {
      const spend = q.energyDiesel + q.energyGas + q.energyGenerator + q.energyOther;
      const entry = totals.get(q.manufacturerId) ?? { sum: 0, count: 0 };
      entry.sum += spend;
      entry.count += 1;
      totals.set(q.manufacturerId, entry);
    });
    const result = new Map<string, number>();
    totals.forEach((v, k) => result.set(k, v.sum / v.count));
    return result;
  }, [questionnaires]);

  const clusterStats = useMemo(
    () =>
      clusters.map((c) => {
        const powers = c.points.map((p) => avgPowerByManufacturer.get(p.id) ?? 0);
        const avgPower = powers.length ? powers.reduce((s, v) => s + v, 0) / powers.length : 0;
        const stateCounts = new Map<string, number>();
        c.points.forEach((p) => stateCounts.set(p.state, (stateCounts.get(p.state) ?? 0) + 1));
        const dominantState = [...stateCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
        return { cluster: c, avgPower, dominantState };
      }),
    [clusters, avgPowerByManufacturer]
  );

  const flyToCluster = useCallback(
    (clusterId: string) => {
      const c = clusters.find((cl) => cl.id === clusterId);
      if (!c || !mapRef.current) return;
      setSelectedClusterId(clusterId);
      mapRef.current.panTo(c.centroid);
      mapRef.current.setZoom(c.points.length > 1 ? 10 : 12);
    },
    [clusters]
  );

  const hoveredCompany = geoManufacturers.find((m) => m.id === hoveredId) ?? null;

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-[1600px]">
      <PageHeader
        title="Cluster Map"
        subtitle="Geographic manufacturing clusters, grouped by proximity radius"
        actions={
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
            <Button variant={showPolygons ? "default" : "outline"} size="sm" onClick={() => setShowPolygons((v) => !v)}>
              <Layers className="w-4 h-4 mr-2" /> Clusters
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        {/* Map */}
        <Card className="p-0 overflow-hidden relative" style={{ height: 640 }}>
          {!isLoaded ? (
            <div className="h-full grid place-items-center text-sm text-muted-foreground">Loading map…</div>
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
              {showPolygons &&
                clusters.map((c) => {
                  const color = clusterColorById.get(c.id)!;
                  const isSelected = selectedClusterId === c.id;
                  if (c.points.length >= 3) {
                    return (
                      <Polygon
                        key={c.id}
                        paths={c.hull}
                        options={{
                          fillColor: color,
                          fillOpacity: isSelected ? 0.32 : 0.16,
                          strokeColor: color,
                          strokeOpacity: 0.9,
                          strokeWeight: isSelected ? 2.5 : 1.5,
                        }}
                        onClick={() => setSelectedClusterId(c.id)}
                      />
                    );
                  }
                  // 1-2 point clusters: shade a circle of the current radius instead of a degenerate hull
                  return (
                    <Circle
                      key={c.id}
                      center={c.centroid}
                      radius={c.radiusKm * 1000}
                      options={{
                        fillColor: color,
                        fillOpacity: isSelected ? 0.28 : 0.13,
                        strokeColor: color,
                        strokeOpacity: 0.8,
                        strokeWeight: isSelected ? 2.5 : 1.25,
                      }}
                      onClick={() => setSelectedClusterId(c.id)}
                    />
                  );
                })}

              {geoManufacturers.map((m) => {
                const clusterId = companyToCluster.get(m.id);
                const color = clusterId ? clusterColorById.get(clusterId)! : "oklch(0.5 0 0)";
                return (
                  <OverlayView
                    key={m.id}
                    position={{ lat: m.lat, lng: m.lng }}
                    mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                  >
                    <div
                      onMouseEnter={() => setHoveredId(m.id)}
                      onMouseLeave={() => setHoveredId((id) => (id === m.id ? null : id))}
                      style={{
                        transform: "translate(-50%, -100%)",
                        cursor: "pointer",
                      }}
                    >
                      <MapPin
                        className="drop-shadow"
                        width={hoveredId === m.id ? 26 : 20}
                        height={hoveredId === m.id ? 26 : 20}
                        style={{ color, fill: color, fillOpacity: 0.25, transition: "all 120ms ease" }}
                      />
                    </div>
                  </OverlayView>
                );
              })}

              {hoveredCompany && (
                <OverlayView
                  position={{ lat: hoveredCompany.lat, lng: hoveredCompany.lng }}
                  mapPaneName={OverlayView.FLOAT_PANE}
                >
                  <div style={{ transform: "translate(-50%, -140%)" }}>
                    <Card className="px-3 py-2 shadow-lg border min-w-[180px] pointer-events-none">
                      <div className="font-medium text-sm truncate">{hoveredCompany.company}</div>
                      <div className="text-xs text-muted-foreground">
                        {hoveredCompany.state} · {hoveredCompany.sectoralGroup}
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-xs font-mono">
                        <Zap className="w-3 h-3 text-energy" />
                        {formatNaira(avgPowerByManufacturer.get(hoveredCompany.id) ?? 0)} avg/period
                      </div>
                    </Card>
                  </div>
                </OverlayView>
              )}
            </GoogleMap>
          )}
        </Card>

        {/* Side panel */}
        <div className="space-y-4">
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Cluster radius</span>
              <Badge variant="secondary">{radiusKm} km</Badge>
            </div>
            <Slider
              min={2}
              max={80}
              step={1}
              value={[radiusKm]}
              onValueChange={([v]) => setRadiusKm(v)}
            />
            <p className="text-xs text-muted-foreground">
              Companies within this distance of a growing cluster's centroid are grouped together. Lower it for
              tight local clusters, raise it for regional groupings.
            </p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-semibold text-sm">Clusters ({clusters.length})</h3>
              <Building2 className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {clusterStats
                .sort((a, b) => b.cluster.points.length - a.cluster.points.length)
                .map(({ cluster, avgPower, dominantState }, i) => {
                  const color = clusterColorById.get(cluster.id)!;
                  const isSelected = selectedClusterId === cluster.id;
                  return (
                    <button
                      key={cluster.id}
                      onClick={() => flyToCluster(cluster.id)}
                      className={`w-full text-left rounded-md border p-3 transition-colors ${
                        isSelected ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-sm font-medium truncate">Cluster {i + 1}</span>
                        <span className="ml-auto text-xs text-muted-foreground">{cluster.points.length} co.</span>
                      </div>
                      <div className="text-xs text-muted-foreground">{dominantState}</div>
                      <div className="flex items-center gap-1 mt-1 text-xs font-mono">
                        <Zap className="w-3 h-3 text-energy" />
                        {formatNaira(avgPower)} avg
                      </div>
                    </button>
                  );
                })}
              {clusters.length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-8">
                  No manufacturers with geographic coordinates yet.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};