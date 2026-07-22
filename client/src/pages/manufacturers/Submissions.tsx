import { useMemo, useState } from "react";
import { useData } from "../../lib/store";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
//import { Badge } from "../../components/ui/badge";
import { PageHeader } from "../../components/page-header";
import { formatNaira } from "../../lib/format";
import { Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";


export function Submissions() {
  const { manufacturers, getQuestionnaireByEmail, removeQuestionnaire } = useData();
  const [query, _setQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { user} = useAuth();
  if(!user){
    return(<></>)
  }
  const questionnaires = getQuestionnaireByEmail(user.email)
  //const { user} = useAuth();

  const rows = useMemo(() => {
    //const q = query.toLowerCase();

    return getQuestionnaireByEmail(user.email)
      .filter((submission) => {
        const submissionTime = new Date(submission.startTime).getTime();
        const fromTime = startDate
          ? new Date(`${startDate}T00:00:00`).getTime()
          : -Infinity;
        const toTime = endDate
          ? new Date(`${endDate}T23:59:59.999`).getTime()
          : Infinity;

        return (
          !Number.isNaN(submissionTime) &&
          submissionTime >= fromTime &&
          submissionTime <= toTime
        );
      })
      .map((m) => {
        const qre = manufacturers.find((x) => x.id === m.manufacturerId);

        return { m: qre, q: m };
      });
  }, [manufacturers, questionnaires, query, startDate, endDate]);
  //const manufacturer = 
  //const powerData = user.role === "manufacturer"?questionnaires.filter((q) => (q.id ==)
  const sanitizeDate = (
    date: Date | string | number | null | undefined,
    subtractOneDay:boolean= false,
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
        subtitle={`${questionnaires.length} companies on file`}
      />

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-3">
          {/* <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="     Search company, state, sector…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div> */}

          <div className="flex items-center gap-2">
            <label htmlFor="submissions-start-date" className="text-xs text-muted-foreground">
              From
            </label>
            <Input
              id="submissions-start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-auto"
            />
            <label htmlFor="submissions-end-date" className="text-xs text-muted-foreground">
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
          <div>
            <Button onClick={() => console.log(true)}>
              <Link to="/questionnaire">Add</Link>
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3">Company</th>
                <th className="text-left px-4 py-3">Start Date</th>
                <th className="text-left px-4 py-3">End Date</th>
                <th className="text-left px-4 py-3">Capacity Utilization (%)</th>
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
                    No Submissions yet. Generate dummy data from the Admin page.
                  </td>
                </tr>
              )}
              {rows.map(({ q, m }) => (
                <tr key={q.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="font-medium">{m?.company}</div>
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
                    <div>{sanitizeDate(q.endTime,true)}</div>
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
                    {formatNaira(q.energyDiesel+q.energyGas+q.energyGenerator+q.energyOther)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    {q ? q.totalWorkers.toLocaleString() : "—"}
                  </td>
                  
                  <td className="flex px-4 py-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => {
                      }}
                    >
                      <Edit className="w-4 h-4" />
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
