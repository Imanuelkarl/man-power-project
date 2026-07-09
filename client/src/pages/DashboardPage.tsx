import { useMemo } from "react";
import { useData } from "../lib/store";
import { clusterManufacturers } from "../lib/clusters";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";
import { Building2, Layers, TrendingUp, Zap, Download, FileText, FileSpreadsheet } from "lucide-react";
import { exportCSV, exportExcel, exportPDF } from "../lib/exports";
import { PageHeader } from "../components/page-header";
import { formatNaira } from "../lib/format";



const COLORS = ["oklch(0.68 0.16 150)", "oklch(0.78 0.15 75)", "oklch(0.65 0.18 240)", "oklch(0.7 0.19 20)", "oklch(0.7 0.17 300)"];

export const DashboardPage: React.FC = () => {
  const { manufacturers, questionnaires } = useData();

  const clusters = useMemo(() => clusterManufacturers(manufacturers), [manufacturers]);

  const byState = useMemo(() => {
    const map = new Map<string, number>();
    manufacturers.forEach((m) => map.set(m.state, (map.get(m.state) ?? 0) + 1));
    return Array.from(map, ([state, count]) => ({ state, count })).sort((a, b) => b.count - a.count).slice(0, 10);
  }, [manufacturers]);

  const bySector = useMemo(() => {
    const map = new Map<string, number>();
    manufacturers.forEach((m) => map.set(m.sectoralGroup, (map.get(m.sectoralGroup) ?? 0) + 1));
    return Array.from(map, ([sector, count]) => ({ sector, count })).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [manufacturers]);

  const avgCapacity = questionnaires.length
    ? (questionnaires.reduce((s, q) => s + q.capacityUtilization, 0) / questionnaires.length).toFixed(1)
    : "—";
  //const totalProduction = questionnaires.reduce((s, q) => s + q.productionValue, 0);
  const totalEnergy = questionnaires.reduce((s, q) => s + q.energyDiesel + q.energyGas + q.energyGenerator + q.energyOther, 0);

  const recent = [...questionnaires].sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1)).slice(0, 6);

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-[1400px]">
      <PageHeader
        title="Dashboard"
        subtitle="Live view of the H1 2026 MAN Economic Review data"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => exportCSV(manufacturers, questionnaires)}>
              <Download className="w-4 h-4 mr-2" /> CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportExcel(manufacturers, questionnaires)}>
              <FileSpreadsheet className="w-4 h-4 mr-2" /> Excel
            </Button>
            <Button size="sm" onClick={() => exportPDF(manufacturers, questionnaires)}>
              <FileText className="w-4 h-4 mr-2" /> PDF
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric icon={Building2} label="Manufacturers" value={manufacturers.length.toLocaleString()} accent="primary" />
        <Metric icon={Layers} label="Clusters identified" value={clusters.length.toLocaleString()} accent="energy" />
        <Metric icon={TrendingUp} label="Avg. capacity utilization" value={`${avgCapacity}%`} />
        <Metric icon={Zap} label="Alt. energy spend" value={formatNaira(totalEnergy)} accent="energy" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold">Manufacturers by state</h3>
            <Badge variant="secondary">Top 10</Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={byState}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="state" stroke="var(--color-muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Bar dataKey="count" fill="oklch(0.68 0.16 150)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="font-display font-semibold mb-4">Sectoral spread</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={bySector} dataKey="count" nameKey="sector" innerRadius={45} outerRadius={80} paddingAngle={3}>
                  {bySector.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold">Recent submissions</h3>
          <div className="text-xs text-muted-foreground">Production value · H1 2026</div>
        </div>
        {recent.length === 0 ? (
          <div className="text-sm text-muted-foreground py-8 text-center">
            No questionnaires yet. Generate dummy data from the Admin page to see this dashboard light up.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recent.map((q) => {
              const m = manufacturers.find((x) => x.id === q.manufacturerId);
              return (
                <div key={q.id} className="py-3 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-md bg-primary/10 grid place-items-center text-primary text-xs font-semibold">
                    {(m?.company ?? "?").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{m?.company ?? "Unknown"}</div>
                    <div className="text-xs text-muted-foreground truncate">{m?.state} · {m?.sectoralGroup}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm">{formatNaira(q.productionValue)}</div>
                    <div className="text-xs text-muted-foreground">Cap. {q.capacityUtilization}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

function Metric({ icon: Icon, label, value, accent }: { icon: any; label: string; value: string; accent?: "primary" | "energy" }) {
  const color = accent === "energy" ? "text-energy" : accent === "primary" ? "text-primary" : "text-foreground";
  const bg = accent === "energy" ? "bg-energy/10" : accent === "primary" ? "bg-primary/10" : "bg-muted";
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
          <div className={`mt-2 font-display text-2xl font-semibold ${color}`}>{value}</div>
        </div>
        <div className={`w-10 h-10 rounded-lg ${bg} grid place-items-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </Card>
  );
}