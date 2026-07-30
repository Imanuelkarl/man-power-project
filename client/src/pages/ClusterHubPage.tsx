

import { useEffect, useMemo, useState } from "react";
import { useData } from "../lib/store";
import { Button } from "../components/ui/button";
import { PageHeader } from "../components/page-header";
import { Plus } from "lucide-react";
import {
  ClusterCard,
  ClusterCreateForm,
  ClusterFilterBar,
} from "../components/cluster/cluster-widgets";
import {
  assignPowerLevels,
  buildClusterWithStats,
  clusterStore,
  computeAvgEnergyByManufacturer,
  computeAvgSpendByManufacturer,
  enrichManufacturers,
} from "../lib/cluster-utils";
import { NIGERIA_REGIONS } from "../lib/nigeria-geo-data";
import { ClusterMapPage } from "./ClusterMapPage";
import type {
  ClusterDefinition,
  ClusterFilters,
  ClusterWithStats,
} from "../types/cluster.types";
import { DEFAULT_CLUSTER_FILTERS } from "../types/cluster.types";
import { loadGeoJSON } from "../lib/location_finder";

type View = "hub" | "map";

export const ClusterHubPage: React.FC = () => {
  const { manufacturers, questionnaires } = useData();

  const [view, setView] = useState<View>("hub");
  const [activeClusterId, setActiveClusterId] = useState<string | null>(null);
  const [defs, setDefs] = useState<ClusterDefinition[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filters, setFilters] = useState<ClusterFilters>(DEFAULT_CLUSTER_FILTERS);

  useEffect(() => {
    loadGeoJSON();
    clusterStore.getClusters().then((saved) => {
      setDefs(saved);
      setLoaded(true);
    });
  }, []);

  const enriched = useMemo(() => enrichManufacturers(manufacturers), [manufacturers]);
  const avgSpendByManufacturer = useMemo(
    () => computeAvgSpendByManufacturer(questionnaires),
    [questionnaires],
  );
  const avgEnergyByManufacturer = useMemo(
    () => computeAvgEnergyByManufacturer(questionnaires),
    [questionnaires],
  );

  const clusters: ClusterWithStats[] = useMemo(() => {
    const withoutLevel = defs.map((def) =>
      buildClusterWithStats(def, enriched, avgSpendByManufacturer, avgEnergyByManufacturer),
    );
    return assignPowerLevels(withoutLevel);
  }, [defs, enriched, avgSpendByManufacturer, avgEnergyByManufacturer]);

  const filteredClusters = useMemo(() => {
    return clusters.filter((c) => {
      if (filters.search && !c.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.geoType !== "all" && c.geoType !== filters.geoType) return false;
      if (filters.powerLevel !== "all" && c.powerLevel !== filters.powerLevel) return false;
      if (filters.region !== "all" && !c.topRegions.includes(filters.region)) return false;
      if (filters.state !== "all" && !c.topStates.includes(filters.state)) return false;
      if (filters.lga !== "all" && !c.lgas.includes(filters.lga) && filters.lga !== "all") {
        // only meaningful for lga/custom clusters that explicitly include this LGA
        if (!c.lgas.includes(filters.lga)) return false;
      }
      return true;
    });
  }, [clusters, filters]);

  const allStates = useMemo(
    () => [...new Set(enriched.map((m) => m.state))].sort(),
    [enriched],
  );
  const allLgaOptions = useMemo(() => {
    const seen = new Map<string, string>();
    enriched.forEach((m) => {
      const [state, lga] = m.lga.split("::");
      seen.set(m.lga, `${state} — ${lga}`);
    });
    return [...seen.entries()].map(([key, label]) => ({ key, label })).sort((a, b) =>
      a.label.localeCompare(b.label),
    );
  }, [enriched]);

  

  const handleCreate = async (def: ClusterDefinition) => {
    await clusterStore.saveCluster(def);
    setDefs((prev) => [...prev, def]);
    setShowCreateForm(false);
  };

  const handleDelete = async (id: string) => {
    await clusterStore.deleteCluster(id);
    setDefs((prev) => prev.filter((d) => d.id !== id));
  };

  const openOnMap = (id: string) => {
    setActiveClusterId(id);
    setView("map");
  };

  if (view === "map") {
    const activeCluster = clusters.find((c) => c.id === activeClusterId) ?? null;
    return (
      <div className="p-6 lg:p-10 space-y-6 max-w-[1600px]">
        <ClusterMapPage
          cluster={activeCluster}
          allClusters={clusters}
          enriched={enriched}
          avgSpendByManufacturer={avgSpendByManufacturer}
          onBack={() => setView("hub")}
        />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-[1600px]">
      <PageHeader
        title="Manufacturing Clusters"
        subtitle="Group companies by state, LGA, ward or region — or merge any mix of them — and track power usage per cluster"
        actions={
          <Button size="sm" onClick={() => setShowCreateForm((v) => !v)}>
            <Plus className="w-4 h-4 mr-2" /> New cluster
          </Button>
        }
      />

      {/* <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatHighlightCard
          icon={Layers}
          label="Saved clusters"
          value={String(clusters.length)}
          sub={`${unclusteredCount} companies not yet clustered`}
        />
        <StatHighlightCard
          icon={TrendingUp}
          label="Most power spent"
          value={mostSpendCluster ? formatNaira(mostSpendCluster.totalEnergySpendNaira) : "—"}
          sub={mostSpendCluster ? `${mostSpendCluster.name} · total` : "No clusters yet"}
        />
        <StatHighlightCard
          icon={Zap}
          label="Most energy used"
          value={
            mostEnergyCluster
              ? `${mostEnergyCluster.totalEnergyConsumedKwh.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })} kWh`
              : "—"
          }
          sub={mostEnergyCluster ? `${mostEnergyCluster.name} · total` : "No clusters yet"}
        />
        <StatHighlightCard
          icon={Building2}
          label="Companies mapped"
          value={String(enriched.length)}
          sub="With usable coordinates"
        />
      </div> */}

      {showCreateForm && (
        <ClusterCreateForm
          enriched={enriched}
          onCreate={handleCreate}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      <ClusterFilterBar
        filters={filters}
        onChange={setFilters}
        regions={[...NIGERIA_REGIONS]}
        states={allStates}
        lgas={allLgaOptions}
      />

      {clusters.length > 0 && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={() => { setActiveClusterId(null); setView("map"); }}>
            View all clusters on map
          </Button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredClusters.map((cluster) => (
          <ClusterCard key={cluster.id} cluster={cluster} onView={openOnMap} onDelete={handleDelete} />
        ))}
        {loaded && filteredClusters.length === 0 && (
          <div className="col-span-full text-sm text-muted-foreground text-center py-16 border border-dashed border-border rounded-lg">
            {clusters.length === 0
              ? "No clusters yet — create one from states, LGAs, wards, regions, or a custom mix."
              : "No clusters match these filters."}
          </div>
        )}
      </div>
    </div>
  );
};