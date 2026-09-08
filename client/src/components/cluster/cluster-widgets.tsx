// components/cluster/cluster-widgets.tsx
//
// UI building blocks for the cluster hub. Follows the same conventions as
// the rest of the app (Card/Badge/Button, oklch palette, formatNaira).

import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  MapPin,
  Search,
  Trash2,
  Eye,
  Download,
} from "lucide-react";
import { formatNaira } from "../../lib/format";
import type {
  ClusterFilters,
  ClusterGeoType,
  ClusterWithStats,
  PowerUsageLevel,
} from "../../types/cluster.types";

// ---------------------------------------------------------------------------
// Power level badge
// ---------------------------------------------------------------------------

const POWER_LEVEL_STYLE: Record<
  PowerUsageLevel,
  { color: string; label: string }
> = {
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
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: style.color }}
      />
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
      {sub && (
        <div className="text-xs text-muted-foreground mt-0.5 truncate">
          {sub}
        </div>
      )}
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

const POWER_LEVEL_OPTIONS: { value: PowerUsageLevel | "all"; label: string }[] =
  [
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
  const set = <K extends keyof ClusterFilters>(
    key: K,
    value: ClusterFilters[K],
  ) => onChange({ ...filters, [key]: value });

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
        onChange={(e) =>
          set("geoType", e.target.value as ClusterGeoType | "all")
        }
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
        onChange={(e) =>
          set("powerLevel", e.target.value as PowerUsageLevel | "all")
        }
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
  onExport,
}: {
  cluster: ClusterWithStats;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
  onExport?: (id: string) => void;
}) {
  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-display font-semibold text-sm">
            {cluster.name}
          </div>
          <div className="text-xs text-muted-foreground capitalize">
            {cluster.geoType} cluster
            {cluster.geoType === "radius" && cluster.radiusKm
              ? ` · ${cluster.radiusKm}km`
              : ""}
          </div>
        </div>
        <PowerLevelBadge level={cluster.powerLevel} />
      </div>

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <MapPin className="w-3.5 h-3.5" />
        {cluster.topStates.slice(0, 3).join(", ") || "No companies yet"}
        {cluster.topStates.length > 3 &&
          ` +${cluster.topStates.length - 3} more`}
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-sm font-mono font-medium">
            {cluster.manufacturerCount}
          </div>
          <div className="text-[10px] text-muted-foreground">Companies</div>
        </div>
        <div>
          <div className="text-sm font-mono font-medium">
            {formatNaira(cluster.totalEnergySpendNaira)}
          </div>
          <div className="text-[10px] text-muted-foreground">Total spend</div>
        </div>
        <div>
          <div className="text-sm font-mono font-medium">
            {cluster.totalEnergyConsumedKwh.toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}
          </div>
          <div className="text-[10px] text-muted-foreground">Total kWh</div>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Button size="sm" className="flex-1" onClick={() => onView(cluster.id)}>
          <Eye className="w-3.5 h-3.5 mr-1.5" /> View on map
        </Button>
        {onExport && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onExport(cluster.id)}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={() => onDelete(cluster.id)}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </Card>
  );
}

