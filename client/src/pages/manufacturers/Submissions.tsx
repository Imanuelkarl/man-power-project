import { useEffect, useMemo, useState } from "react";
import { useData } from "../../lib/store";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { PageHeader } from "../../components/page-header";
import { formatNaira } from "../../lib/format";
import { Edit, Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export function Submissions() {
  const {
    manufacturers,
    questionnaires,
    getQuestionnaireByEmail,
    removeQuestionnaire,
    fetchManufacturers,
    fetchQuestionnaires,
  } = useData();
  const [query, setQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    void fetchManufacturers();
    void fetchQuestionnaires();
  }, [fetchManufacturers, fetchQuestionnaires]);

  if (!user) {
    return <></>;
  }
  const isAdmin = user.role === "admin";

  const rows = useMemo(() => {
    const source = isAdmin
      ? questionnaires
      : getQuestionnaireByEmail(user.email);
    const normalizedQuery = query.trim().toLowerCase();

    return source
      .filter((submission) => {
        const manufacturer = manufacturers.find(
          (candidate) => candidate.manId === submission.manufacturerId,
        );
        const submissionTime = new Date(submission.startTime).getTime();
        const fromTime = startDate
          ? new Date(`${startDate}T00:00:00`).getTime()
          : -Infinity;
        const toTime = endDate
          ? new Date(`${endDate}T23:59:59.999`).getTime()
          : Infinity;

        return (
          (!normalizedQuery ||
            manufacturer?.name.toLowerCase().includes(normalizedQuery) ||
            submission.period.toLowerCase().includes(normalizedQuery)) &&
          !Number.isNaN(submissionTime) &&
          submissionTime >= fromTime &&
          submissionTime <= toTime
        );
      })
      .map((m) => {
        const qre = manufacturers.find((x) => x.manId === m.manufacturerId);

        return { m: qre, q: m };
      });
  }, [
    manufacturers,
    questionnaires,
    query,
    startDate,
    endDate,
    isAdmin,
    getQuestionnaireByEmail,
    user.email,
  ]);
  //const manufacturer =
  //const powerData = user.role === "manufacturer"?questionnaires.filter((q) => (q.id ==)
  const sanitizeDate = (
    date: Date | string | number | null | undefined,
    subtractOneDay: boolean = false,
  ) => {
    if (!date) return "—";

    const parsedDate =
      typeof date === "string" || typeof date === "number"
        ? new Date(date)
        : date;

    if (Number.isNaN(parsedDate.getTime())) return "—";
    if (subtractOneDay) {
      parsedDate.setDate(parsedDate.getDate() - 1);
    }
    return parsedDate.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-[1400px]">
      <PageHeader
        title="Submissions"
        subtitle={
          isAdmin
            ? "Review and submit data for every manufacturer"
            : `${questionnaires.length} submissions on file`
        }
      />

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Input
              placeholder="Search company or period"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <label
              htmlFor="submissions-start-date"
              className="text-xs text-muted-foreground"
            >
              From
            </label>
            <Input
              id="submissions-start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-auto"
            />
            <label
              htmlFor="submissions-end-date"
              className="text-xs text-muted-foreground"
            >
              To
            </label>
            <Input
              id="submissions-end-date"
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-auto"
            />
          </div>

          <div className="text-xs text-muted-foreground ml-auto">
            {rows.length} shown
          </div>
          {isAdmin ? (
            <AdminSubmissionAction manufacturers={manufacturers} />
          ) : (
            <Button asChild>
              <Link to="/questionnaire">Add submission</Link>
            </Button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3">Company</th>
                <th className="text-left px-4 py-3">Start Date</th>
                <th className="text-left px-4 py-3">End Date</th>
                <th className="text-left px-4 py-3">
                  Capacity Utilization (%)
                </th>
                <th className="text-right px-4 py-3">Production Value (₦)</th>
                <th className="text-right px-4 py-3">Raw Material Cost</th>
                <th className="text-right px-4 py-3">Total Alt. Energy Cost</th>
                <th className="text-right px-4 py-3">Workers</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-10 text-muted-foreground"
                  >
                    No submissions match the current filters.
                  </td>
                </tr>
              )}
              {rows.map(({ q, m }) => (
                <tr key={q.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="font-medium">
                      {m?.name ?? "Unknown company"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {q.submittedBy}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>{sanitizeDate(q.startTime)}</div>
                    {/* <div className="text-xs text-muted-foreground">
                      {q.electricityHours}
                    </div> */}
                  </td>
                  <td className="px-4 py-3">
                    <div>{sanitizeDate(q.endTime, true)}</div>
                    {/* <Badge variant="secondary" className="font-normal">
                      {q.energyDiesel}
                    </Badge> */}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    {q ? `${q.capacityUtilization}%` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    {q ? formatNaira(q.productionValue) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    {formatNaira(q.rawMaterialsCost)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    {formatNaira(
                      q.energyDiesel +
                        q.energyGas +
                        q.energyGenerator +
                        q.energyOther,
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    {q ? q.totalWorkers.toLocaleString() : "—"}
                  </td>

                  <td className="flex px-4 py-3 gap-1">
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      aria-label="View submission details"
                    >
                      <Link to={`/submissions/${q.id}`}>
                        <Eye className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Link
                        to={`/questionnaire/${q.id}?manufacturerId=${encodeURIComponent(q.manufacturerId)}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => {
                        removeQuestionnaire(q.id);
                        toast.success(`Removed Questionnaire ${q?.id}`);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function AdminSubmissionAction({
  manufacturers,
}: {
  manufacturers: { manId: string; name: string }[];
}) {
  const [manufacturerId, setManufacturerId] = useState("");
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-2">
      <Select value={manufacturerId} onValueChange={setManufacturerId}>
        <SelectTrigger className="w-[220px]">
          <SelectValue placeholder="Select manufacturer" />
        </SelectTrigger>
        <SelectContent>
          {manufacturers.map((manufacturer) => (
            <SelectItem key={manufacturer.manId} value={manufacturer.manId}>
              {manufacturer.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        disabled={!manufacturerId}
        onClick={() =>
          navigate(
            `/questionnaire?manufacturerId=${encodeURIComponent(manufacturerId)}`,
          )
        }
      >
        Add submission
      </Button>
    </div>
  );
}
