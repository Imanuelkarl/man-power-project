// ManufacturerDashboard.tsx
import { useMemo } from "react";
import { useData } from "../lib/store"; // Assuming you have an auth hook
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Building2,
  TrendingUp,
  Zap,
  Download,
  FileText,
  FileSpreadsheet,
  Calendar,
  Activity,
  DollarSign,
} from "lucide-react";
import { exportCSV, exportExcel, exportPDF } from "../lib/exports";
import { PageHeader } from "../components/page-header";
import { formatNaira, formatPower } from "../lib/format";
import { useAuth } from "../context/AuthContext";

const COLORS = [
  "oklch(0.68 0.16 150)",
  "oklch(0.78 0.15 75)",
  "oklch(0.65 0.18 240)",
  "oklch(0.7 0.19 20)",
  "oklch(0.7 0.17 300)",
];

interface ManufacturerDashboardProps {
  manufacturerId?: number; // Optional: if not provided, will use from auth
}

export const ManufacturerDashboard: React.FC<ManufacturerDashboardProps> = ({
  manufacturerId: propManufacturerId,
}) => {
  const { manufacturers, questionnaires } = useData();
  const { user } = useAuth(); // Assuming you have an auth context/hook

  // Determine which manufacturer to show
  const targetManufacturerId = useMemo(() => {
    if (user?.role === "manufacturer") {
      return user?.email;
    }
    return propManufacturerId;
  }, [user, propManufacturerId]);

  // Get the manufacturer data
  const manufacturer = useMemo(() => {
    return manufacturers.find((m) => m.email === targetManufacturerId);
  }, [manufacturers, targetManufacturerId]);

  // Filter questionnaires for this manufacturer
  const manufacturerData = useMemo(() => {
    if (!targetManufacturerId) return [];
    return questionnaires.filter((q) => q.manufacturerId === manufacturer?.id);
  }, [questionnaires, targetManufacturerId]);

  // Calculate metrics
  const metrics = useMemo(() => {
    if (manufacturerData.length === 0) {
      return {
        avgCapacity: "—",
        totalEnergyConsumed: 0,
        totalEnergyGenerated: 0,
        totalProductionValue: 0,
        avgUtilization: 0,
        latestPeriod: null,
        totalSubmissions: 0,
      };
    }

    const totalEnergyConsumed = manufacturerData.reduce(
      (s, q) => s + q.totalEnergyConsumed,
      0,
    );
    const totalEnergyGenerated = manufacturerData.reduce(
      (s, q) => s + q.totalEnergyGenerated,
      0,
    );
    const totalProductionValue = manufacturerData.reduce(
      (s, q) => s + q.productionValue,
      0,
    );
    const avgCapacity = (
      manufacturerData.reduce((s, q) => s + q.capacityUtilization, 0) /
      manufacturerData.length
    ).toFixed(1);
    const avgUtilization = parseFloat(avgCapacity);

    const latest = manufacturerData.sort(
      (a, b) =>
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
    )[0];

    return {
      avgCapacity,
      totalEnergyConsumed,
      totalEnergyGenerated,
      totalProductionValue,
      avgUtilization,
      latestPeriod: latest?.period || null,
      totalSubmissions: manufacturerData.length,
    };
  }, [manufacturerData]);

  // Energy mix data for pie chart
  const energyMix = useMemo(() => {
    const latest = manufacturerData.sort(
      (a, b) =>
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
    )[0];

    if (!latest) return [];

    const mix = [
      { name: "Gas", value: latest.energyGas || 0 },
      { name: "Diesel", value: latest.energyDiesel || 0 },
      { name: "Generator", value: latest.energyGenerator || 0 },
      { name: "Other", value: latest.energyOther || 0 },
    ].filter((item) => item.value > 0);

    return mix;
  }, [manufacturerData]);

  // Investment breakdown
  const investmentData = useMemo(() => {
    const latest = manufacturerData.sort(
      (a, b) =>
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
    )[0];

    if (!latest) return [];

    return [
      { name: "Land & Buildings", value: latest.investLandBuildings || 0 },
      { name: "Plant & Equipment", value: latest.investPlant || 0 },
      { name: "Furniture", value: latest.investFurniture || 0 },
      { name: "Vehicles", value: latest.investVehicles || 0 },
      { name: "Work in Progress", value: latest.investInProgress || 0 },
    ].filter((item) => item.value > 0);
  }, [manufacturerData]);

  // If manufacturer not found
  if (!manufacturer) {
    return (
      <div className="p-6 lg:p-10">
        <Card className="p-8 text-center">
          <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Manufacturer Data</h2>
          <p className="text-muted-foreground">
            {user?.role === "manufacturer"
              ? "Your company data is not available yet. Please contact support."
              : "No manufacturer found with the provided ID."}
          </p>
        </Card>
      </div>
    );
  }

  // If no questionnaire data
  if (manufacturerData.length === 0) {
    return (
      <div className="p-6 lg:p-10 space-y-6 max-w-[1400px]">
        <PageHeader
          title={`${manufacturer.name} Dashboard`}
          subtitle={`${manufacturer.sectoral_group} · ${manufacturer.city}, ${manufacturer.state}`}
        />
        <Card className="p-8 text-center">
          <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Data Submitted</h2>
          <p className="text-muted-foreground">
            No questionnaire data has been submitted for this manufacturer yet.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-[1400px]">
      <PageHeader
        title={`${manufacturer.name} Dashboard`}
        subtitle={`${manufacturer.sectoral_group} · ${manufacturer.city}, ${manufacturer.state}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportCSV([manufacturer], manufacturerData)}
            >
              <Download className="w-4 h-4 mr-2" /> CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportExcel([manufacturer], manufacturerData)}
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" /> Excel
            </Button>
            <Button
              size="sm"
              onClick={() => exportPDF([manufacturer], manufacturerData)}
            >
              <FileText className="w-4 h-4 mr-2" /> PDF
            </Button>
          </div>
        }
      />

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric
          icon={TrendingUp}
          label="Avg. Capacity Utilization"
          value={`${metrics.avgCapacity}%`}
          accent="primary"
        />
        <Metric
          icon={Zap}
          label="Total Energy Consumed"
          value={formatPower(metrics.totalEnergyConsumed)}
          accent="energy"
        />
        <Metric
          icon={DollarSign}
          label="Total Production Value"
          value={formatNaira(metrics.totalProductionValue)}
          accent="primary"
        />
        <Metric
          icon={Activity}
          label="Total Submissions"
          value={metrics.totalSubmissions.toString()}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Investment Breakdown */}
        {investmentData.length > 0 && (
          <Card className="p-5 col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold">
                Investment Breakdown
              </h3>
              <Badge variant="secondary">Latest Period</Badge>
            </div>
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={investmentData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-border)"
                  />
                  <XAxis
                    dataKey="name"
                    stroke="var(--color-muted-foreground)"
                    fontSize={11}
                  />
                  <YAxis
                    stroke="var(--color-muted-foreground)"
                    fontSize={11}
                    tickFormatter={(value) => formatNaira(value)}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                    }}
                    formatter={(value: any) => formatNaira(value)}
                  />
                  <Bar
                    dataKey="value"
                    fill="oklch(0.68 0.16 150)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {/* Energy Mix */}
        <Card className="p-5">
          <h3 className="font-display font-semibold mb-4">Energy Mix</h3>
          {energyMix.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
              No energy data available
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={energyMix}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={45}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {energyMix.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                    }}
                    formatter={(value: any) => formatNaira(value)}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* Recent Submissions */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold">Submission History</h3>
          <div className="text-xs text-muted-foreground">
            {manufacturerData.length} total submissions
          </div>
        </div>
        {manufacturerData.length === 0 ? (
          <div className="text-sm text-muted-foreground py-8 text-center">
            No submissions yet.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {manufacturerData
              .sort(
                (a, b) =>
                  new Date(b.submittedAt).getTime() -
                  new Date(a.submittedAt).getTime(),
              )
              .slice(0, 10)
              .map((q) => (
                <div key={q.id} className="py-3 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-md bg-primary/10 grid place-items-center text-primary text-xs font-semibold">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{q.period}</div>
                    <div className="text-xs text-muted-foreground">
                      Submitted: {new Date(q.submittedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm">
                      {formatNaira(q.productionValue)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Cap. {q.capacityUtilization}% ·{" "}
                      {formatPower(q.totalEnergyConsumed)}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </Card>
    </div>
  );
};

// Helper Metric component
function Metric({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: any;
  label: string;
  value: string;
  accent?: "primary" | "energy";
}) {
  const color =
    accent === "energy"
      ? "text-energy"
      : accent === "primary"
        ? "text-primary"
        : "text-foreground";
  const bg =
    accent === "energy"
      ? "bg-energy/10"
      : accent === "primary"
        ? "bg-primary/10"
        : "bg-muted";
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">
            {label}
          </div>
          <div className={`mt-2 font-display text-2xl font-semibold ${color}`}>
            {value}
          </div>
        </div>
        <div
          className={`w-10 h-10 rounded-lg ${bg} grid place-items-center ${color}`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </Card>
  );
}
