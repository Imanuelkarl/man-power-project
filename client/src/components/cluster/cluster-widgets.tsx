// components/cluster/cluster-widgets.tsx
//
// UI building blocks for the cluster hub. Follows the same conventions as
// the rest of the app (Card/Badge/Button, oklch palette, formatNaira).

import { useMemo, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { MapPin, Plus, X, Search, Trash2, Eye, Crosshair, Map as MapIcon } from "lucide-react";
import { formatNaira } from "../../lib/format";
import {
  NIGERIA_REGIONS,
  getAllStates,
  getLgasForState,
  lgaKey,
} from "../../lib/nigeria-geo-data";
import { resolveMembers, newClusterId } from "../../lib/cluster-utils";
import type {
  ClusterDefinition,
  ClusterFilters,
  ClusterFocalPoint,
  ClusterGeoType,
  ClusterWithStats,
  EnrichedManufacturer,
  PowerUsageLevel,
} from "../../types/cluster.types";

// ---------------------------------------------------------------------------
// Power level badge
// ---------------------------------------------------------------------------

const POWER_LEVEL_STYLE: Record<PowerUsageLevel, { color: string; label: string }> = {
  high: { color: "oklch(0.65 0.21 25)", label: "High power" },
  medium: { color: "oklch(0.78 0.15 75)", label: "Medium power" },
  low: { color: "oklch(0.68 0.16 150)", label: "Low power" },
};

export function PowerLevelBadge({ level }: { level: PowerUsageLevel }) {
  const style = POWER_LEVEL_STYLE[level];
  return (
    <Badge
      variant="secondary"
      className="gap-1"
      style={{ color: style.color, borderColor: style.color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: style.color }} />
      {style.label}
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// Stat highlight card (most power spent / most energy used / etc.)
// ---------------------------------------------------------------------------

export function StatHighlightCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </div>
      <div className="font-display font-semibold text-lg truncate">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5 truncate">{sub}</div>}
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Filter bar
// ---------------------------------------------------------------------------

const GEO_TYPE_OPTIONS: { value: ClusterGeoType | "all"; label: string }[] = [
  { value: "all", label: "All types" },
  { value: "region", label: "Region" },
  { value: "state", label: "State" },
  { value: "lga", label: "LGA" },
  { value: "ward", label: "Ward" },
  { value: "radius", label: "Radius" },
  { value: "custom", label: "Custom" },
];

const POWER_LEVEL_OPTIONS: { value: PowerUsageLevel | "all"; label: string }[] = [
  { value: "all", label: "All power levels" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export function ClusterFilterBar({
  filters,
  onChange,
  regions,
  states,
}: {
  filters: ClusterFilters;
  onChange: (next: ClusterFilters) => void;
  regions: string[];
  states: string[];
  lgas: { key: string; label: string }[];
}) {
  const set = <K extends keyof ClusterFilters>(key: K, value: ClusterFilters[K]) =>
    onChange({ ...filters, [key]: value });

  return (
    <Card className="p-3 flex flex-wrap items-center gap-2">
      <div className="relative flex-1 min-w-[180px]">
        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.search}
          onChange={(e) => set("search", e.target.value)}
          placeholder="Search clusters…"
          className="pl-8 h-9"
        />
      </div>

      <select
        className="h-9 rounded-md border border-border bg-background px-2 text-sm"
        value={filters.geoType}
        onChange={(e) => set("geoType", e.target.value as ClusterGeoType | "all")}
      >
        {GEO_TYPE_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <select
        className="h-9 rounded-md border border-border bg-background px-2 text-sm"
        value={filters.region}
        onChange={(e) => set("region", e.target.value)}
      >
        <option value="all">All regions</option>
        {regions.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>

      <select
        className="h-9 rounded-md border border-border bg-background px-2 text-sm"
        value={filters.state}
        onChange={(e) => set("state", e.target.value)}
      >
        <option value="all">All states</option>
        {states.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>


      <select
        className="h-9 rounded-md border border-border bg-background px-2 text-sm"
        value={filters.powerLevel}
        onChange={(e) => set("powerLevel", e.target.value as PowerUsageLevel | "all")}
      >
        {POWER_LEVEL_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Cluster card
// ---------------------------------------------------------------------------

export function ClusterCard({
  cluster,
  onView,
  onDelete,
}: {
  cluster: ClusterWithStats;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-display font-semibold text-sm">{cluster.name}</div>
          <div className="text-xs text-muted-foreground capitalize">
            {cluster.geoType} cluster
            {cluster.geoType === "radius" && cluster.radiusKm ? ` · ${cluster.radiusKm}km` : ""}
          </div>
        </div>
        <PowerLevelBadge level={cluster.powerLevel} />
      </div>

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <MapPin className="w-3.5 h-3.5" />
        {cluster.topStates.slice(0, 3).join(", ") || "No companies yet"}
        {cluster.topStates.length > 3 && ` +${cluster.topStates.length - 3} more`}
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-sm font-mono font-medium">{cluster.manufacturerCount}</div>
          <div className="text-[10px] text-muted-foreground">Companies</div>
        </div>
        <div>
          <div className="text-sm font-mono font-medium">{formatNaira(cluster.totalEnergySpendNaira)}</div>
          <div className="text-[10px] text-muted-foreground">Total spend</div>
        </div>
        <div>
          <div className="text-sm font-mono font-medium">
            {cluster.totalEnergyConsumedKwh.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[10px] text-muted-foreground">Total kWh</div>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Button size="sm" className="flex-1" onClick={() => onView(cluster.id)}>
          <Eye className="w-3.5 h-3.5 mr-1.5" /> View on map
        </Button>
        <Button size="sm" variant="outline" onClick={() => onDelete(cluster.id)}>
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Shared bits for the create form
// ---------------------------------------------------------------------------

const GEO_TYPE_CHOICES: { value: ClusterGeoType; label: string; hint: string }[] = [
  { value: "region", label: "Region", hint: "Merge one or more geopolitical zones" },
  { value: "state", label: "State", hint: "Merge one or more states" },
  { value: "lga", label: "LGA", hint: "Merge one or more LGAs, across states" },
  { value: "radius", label: "Radius", hint: "Everyone within a distance of a chosen point" },
  { value: "custom", label: "Custom", hint: "Mix regions, states, LGAs and wards freely" },
];

function PickerList({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: { key: string; label: string }[];
  selected: string[];
  onToggle: (key: string) => void;
}) {
  return (
    <div>
      <div className="text-xs font-medium text-muted-foreground mb-1.5">{label}</div>
      <div className="border border-border rounded-md max-h-40 overflow-y-auto divide-y divide-border">
        {options.length === 0 && (
          <div className="px-2.5 py-3 text-xs text-muted-foreground">No options available</div>
        )}
        {options.map((opt) => {
          const isOn = selected.includes(opt.key);
          return (
            <button
              key={opt.key}
              onClick={() => onToggle(opt.key)}
              className={`w-full text-left px-2.5 py-1.5 text-xs flex items-center gap-2 ${
                isOn ? "bg-primary/10 text-primary" : "hover:bg-muted/50"
              }`}
            >
              <span
                className={`w-3 h-3 rounded-sm border flex-shrink-0 ${
                  isOn ? "bg-primary border-primary" : "border-border"
                }`}
              />
              <span className="truncate">{opt.label}</span>
            </button>
          );
        })}
      </div>
      {selected.length > 0 && (
        <div className="text-[10px] text-muted-foreground mt-1">{selected.length} selected</div>
      )}
    </div>
  );
}

function SelectedChips({
  items,
  onRemove,
}: {
  items: { key: string; label: string }[];
  onRemove: (key: string) => void;
}) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item.key}
          className="inline-flex items-center gap-1 bg-muted/60 border border-border rounded-full pl-2.5 pr-1 py-0.5 text-[11px]"
        >
          {item.label}
          <button
            onClick={() => onRemove(item.key)}
            className="hover:bg-muted rounded-full p-0.5"
            aria-label={`Remove ${item.label}`}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Focal point picker (for "radius" clusters)
// ---------------------------------------------------------------------------

const NIGERIA_CENTER = { lat: 9.082, lng: 8.6753 };

function FocalPointMapModal({
  enriched,
  onPick,
  onClose,
}: {
  enriched: EnrichedManufacturer[];
  onPick: (point: ClusterFocalPoint) => void;
  onClose: () => void;
}) {
  const { isLoaded } = useJsApiLoader({
    id: "cluster-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
  });
  const [pending, setPending] = useState<ClusterFocalPoint | null>(null);
  

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl p-0 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="font-display font-semibold text-sm">Click a point on the map</div>
          <Button size="sm" variant="ghost" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div style={{ height: 440 }}>
          {!isLoaded ? (
            <div className="h-full grid place-items-center text-sm text-muted-foreground">
              Loading map…
            </div>
          ) : (
            <GoogleMap
              mapContainerStyle={{ width: "100%", height: "100%" }}
              center={NIGERIA_CENTER}
              zoom={6}
              options={{ streetViewControl: false, fullscreenControl: false, mapTypeControl: false }}
              onClick={(e) => {
                if (!e.latLng) return;
                setPending({ lat: e.latLng.lat(), lng: e.latLng.lng(), label: "Custom point" });
              }}
            >
              {enriched.map((m) => (
                <Marker
                  key={m.id}
                  position={{ lat: m.lat, lng: m.lng }}
                  icon={{
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 3,
                    fillColor: "#888",
                    fillOpacity: 0.6,
                    strokeWeight: 0,
                  }}
                />
              ))}
              {pending && <Marker position={pending} />}
            </GoogleMap>
          )}
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <div className="text-xs text-muted-foreground">
            {pending ? "Point selected — confirm to use it." : "Click anywhere on the map to drop a point."}
          </div>
          <Button size="sm" disabled={!pending} onClick={() => pending && onPick(pending)}>
            Use this point
          </Button>
        </div>
      </Card>
    </div>
  );
}

function FocalPointPicker({
  enriched,
  value,
  onChange,
}: {
  enriched: EnrichedManufacturer[];
  value: ClusterFocalPoint | null;
  onChange: (point: ClusterFocalPoint | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [showList,setShowList] = useState(false);

  const matches = useMemo(() => {
    //if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    return enriched.filter((m) => m.company.toLowerCase().includes(q)).slice(0, 8);
  }, [query, enriched]);

  return (
    <div className="space-y-2">
      <div className="text-xs font-medium text-muted-foreground">Focal point</div>

      {value ? (
        <div className="flex items-center justify-between border border-border rounded-md px-3 py-2 text-sm">
          <div className="flex items-center gap-2">
            <Crosshair className="w-3.5 h-3.5 text-primary" />
            {value.label}
          </div>
          <Button size="sm" variant="ghost" onClick={() => onChange(null)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() =>setShowList(true)}
              onBlur={() => setShowList(false)}
              placeholder="Search a company to center on…"
              className="pl-8 h-9"
            />
          </div>
          {(matches.length > 0&& showList) && (
            <div className="border border-border rounded-md max-h-36 overflow-y-auto divide-y divide-border">
              {matches.map((m) => (
                <button
                  key={m.id}
                  onClick={() =>
                    onChange({ lat: m.lat, lng: m.lng, label: m.company })
                  }
                  className="w-full text-left px-2.5 py-1.5 text-xs hover:bg-muted/50 truncate"
                >
                  {m.company} <span className="text-muted-foreground">· {m.state}</span>
                </button>
              ))}
            </div>
          )}
          <Button size="sm" variant="outline" onClick={() => setShowMap(true)}>
            <MapIcon className="w-3.5 h-3.5 mr-1.5" /> Pick a point on the map
          </Button>
        </div>
      )}

      {showMap && (
        <FocalPointMapModal
          enriched={enriched}
          onClose={() => setShowMap(false)}
          onPick={(point) => {
            onChange(point);
            setShowMap(false);
          }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Create-cluster form
// ---------------------------------------------------------------------------

export function ClusterCreateForm({
  enriched,
  onCreate,
  onCancel,
}: {
  enriched: EnrichedManufacturer[];
  onCreate: (def: ClusterDefinition) => void;
  onCancel: () => void;
}) {
  const [geoType, setGeoType] = useState<ClusterGeoType>("state");
  const [name, setName] = useState("");
  const [regions, setRegions] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [lgas, setLgas] = useState<string[]>([]);
  const [wards, _setWards] = useState<string[]>([]);
  const [focalPoint, setFocalPoint] = useState<ClusterFocalPoint | null>(null);
  const [radiusKm, setRadiusKm] = useState<number>(25);

  // Scopes just for browsing the LGA/ward dropdowns — not part of the
  // saved selection themselves.
  const [scopeState, setScopeState] = useState("");
  const [_scopeLga, setScopeLga] = useState("");

  const allRegions = [...NIGERIA_REGIONS];
  const allStates = useMemo(() => getAllStates(), []);
  const lgaOptionsForScope = useMemo(
    () => (scopeState ? getLgasForState(scopeState).map((l) => ({ key: lgaKey(scopeState, l), label: l })) : []),
    [scopeState],
  );

  const toggle = (list: string[], setList: (v: string[]) => void, value: string) => {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  const previewCount = useMemo(() => {
    if (geoType === "radius") {
      if (!focalPoint || !radiusKm) return 0;
      return resolveMembers(
        { regions: [], states: [], lgas: [], wards: [], manufacturerIds: [], focalPoint, radiusKm },
        enriched,
      ).length;
    }
    return resolveMembers(
      { regions, states, lgas, wards, manufacturerIds: [] },
      enriched,
    ).length;
  }, [geoType, regions, states, lgas, wards, focalPoint, radiusKm, enriched]);

  const canSave =
    name.trim().length > 0 &&
    previewCount > 0 &&
    (geoType !== "radius" || (!!focalPoint && radiusKm > 0));

  const handleSave = () => {
    if (!canSave) return;
    const now = new Date().toISOString();
    onCreate({
      id: newClusterId(),
      name: name.trim(),
      geoType,
      regions: geoType === "custom" || geoType === "region" ? regions : [],
      states: geoType === "custom" || geoType === "state" ? states : [],
      lgas: geoType === "custom" || geoType === "lga" ? lgas : [],
      wards: geoType === "custom" || geoType === "ward" ? wards : [],
      manufacturerIds: [],
      focalPoint: geoType === "radius" ? focalPoint ?? undefined : undefined,
      radiusKm: geoType === "radius" ? radiusKm : undefined,
      createdAt: now,
      updatedAt: now,
    });
  };

  const showRegions = geoType === "region" || geoType === "custom";
  const showStates = geoType === "state" || geoType === "custom";
  const showLgas = geoType === "lga" || geoType === "custom";
  const showWards = geoType === "ward" || geoType === "custom";
  const showRadius = geoType === "radius";

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-sm">New cluster</h3>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Cluster name, e.g. South West Textile Belt"
      />

      <div>
        <div className="text-xs font-medium text-muted-foreground mb-2">Built from</div>
        <div className="flex flex-wrap gap-2">
          {GEO_TYPE_CHOICES.map((choice) => (
            <button
              key={choice.value}
              onClick={() => setGeoType(choice.value)}
              title={choice.hint}
              className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-colors ${
                geoType === choice.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:bg-muted/50"
              }`}
            >
              {choice.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">
          {GEO_TYPE_CHOICES.find((c) => c.value === geoType)?.hint}
        </p>
      </div>

      {(showRegions || showStates) && (
        <div className="grid gap-3 sm:grid-cols-2">
          {showRegions && (
            <PickerList
              label="Regions"
              options={allRegions.map((r) => ({ key: r, label: r }))}
              selected={regions}
              onToggle={(v) => toggle(regions, setRegions, v)}
            />
          )}
          {showStates && (
            <PickerList
              label="States"
              options={allStates.map((s) => ({ key: s, label: s }))}
              selected={states}
              onToggle={(v) => toggle(states, setStates, v)}
            />
          )}
        </div>
      )}

      {(showLgas ) && (
        <div className="space-y-3 border-t border-border pt-3">
          <div className="text-xs font-medium text-muted-foreground">Browse by state{showWards ? " and LGA" : ""}</div>
          <div className="flex flex-wrap gap-2">
            <select
              className="h-9 rounded-md border border-border bg-background px-2 text-sm"
              value={scopeState}
              onChange={(e) => {
                setScopeState(e.target.value);
                setScopeLga("");
              }}
            >
              <option value="">Select a state…</option>
              {allStates.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {showLgas && (
              <PickerList
                label={scopeState ? `LGAs in ${scopeState}` : "LGAs (pick a state above)"}
                options={lgaOptionsForScope}
                selected={lgas}
                onToggle={(v) => toggle(lgas, setLgas, v)}
              />
            )}
            
          </div>

          {showLgas && lgas.length > 0 && (
            <SelectedChips
              items={lgas.map((key) => ({ key, label: key.split("::").join(" — ") }))}
              onRemove={(key) => setLgas((prev) => prev.filter((k) => k !== key))}
            />
          )}
          
        </div>
      )}

      {showRadius && (
        <div className="space-y-3 border-t border-border pt-3">
          <FocalPointPicker enriched={enriched} value={focalPoint} onChange={setFocalPoint} />
          <div>
            <label className="text-xs font-medium text-muted-foreground">Radius (km)</label>
            <Input
              type="number"
              min={1}
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value) || 0)}
              className="mt-1 h-9 w-32"
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div className="text-xs text-muted-foreground">
          <span className="font-mono font-medium text-foreground">{previewCount}</span> companies
          match this selection
        </div>
        <Button size="sm" disabled={!canSave} onClick={handleSave}>
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Save cluster
        </Button>
      </div>
    </Card>
  );
}