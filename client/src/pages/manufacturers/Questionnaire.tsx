import { useEffect, useMemo, useState } from "react";
import {
  useData,
  SECTORAL_GROUPS,
  NIGERIAN_STATES,
  type PowerData,
} from "../../lib/store";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { PageHeader } from "../../components/page-header";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import type { Manufacturer } from "../../types/manufacturer.types";

const num = (v: string) => (v === "" ? 0 : Number(v));
const getMonthFromDate = (date: string, subtractOneDay = false) => {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  if (subtractOneDay) {
    parsed.setDate(parsed.getDate() - 1);
  }
  return parsed.toLocaleString("default", { month: "long" });
};
interface QuestionnaireFormProp{
  setStep?: (step: number) =>void;
}

export function QuestionnaireForm({setStep} : QuestionnaireFormProp) {
  
  const { user } = useAuth(); //useAuth((s) => s.user)!;
  const [startMonth, setStartMonth] =useState("January");
  const [endMonth, setEndMonth] = useState("June");
  const [startTime, setStartTime] = useState("2026-01-01");
  const [endTime, setEndTime] = useState("2026-07-01");
  const [year, setYear] = useState(new Date().getFullYear());
  const {
    manufacturers,
    questionnaires,
    addManufacturer,
    upsertQuestionnaire,
  } = useData();
  if (!user) {
    return <>No user found</>;
  }

  const existing = useMemo(() => {
    if (user.email) {
      const m = manufacturers.find((x) => x.email === user.email);
      const q = questionnaires.find(
        (x) => x.manufacturerId === m?.id && x.period === "H1 2026",
      );
      return { m, q };
    }
    return { m: undefined, q: undefined };
  }, [manufacturers, questionnaires, user.email]);

  const [profile, setProfile] = useState({
    company: existing.m?.company ?? "",
    contactPerson: existing.m?.contactPerson ?? user.name ?? "",
    email: existing.m?.email ?? user.email,
    phone: existing.m?.phone ?? "",
    branch: existing.m?.branch ?? "",
    sectoralGroup: existing.m?.sectoralGroup ?? SECTORAL_GROUPS[0],
    subSector: existing.m?.subSector ?? "",
    state: existing.m?.state ?? NIGERIAN_STATES[0].state,
  });

  useEffect(() =>{
    setStartMonth(getMonthFromDate(startTime));
    setEndMonth(getMonthFromDate(endTime,true));
    setYear(new Date(startTime).getFullYear());
  },[startTime,endTime]);
  const [form, setForm] = useState({
    startTime: existing.q?.startTime ?? null,
    endTime: existing.q?.endTime ?? null,
    capacityUtilization: existing.q?.capacityUtilization ?? 0,
    productionValue: existing.q?.productionValue ?? 0,
    rawMaterialsCost: existing.q?.rawMaterialsCost ?? 0,
    rawMaterialsTransport: existing.q?.rawMaterialsTransport ?? 0,
    localSourcing: existing.q?.localSourcing ?? 0,
    unsoldGoods: existing.q?.unsoldGoods ?? 0,
    newHires: existing.q?.newHires ?? 0,
    totalWorkers: existing.q?.totalWorkers ?? 0,
    workersLeft: existing.q?.workersLeft ?? 0,
    interestRate: existing.q?.interestRate ?? 0,
    exchangeRate: existing.q?.exchangeRate ?? 0,
    investLandBuildings: existing.q?.investLandBuildings ?? 0,
    investPlant: existing.q?.investPlant ?? 0,
    investFurniture: existing.q?.investFurniture ?? 0,
    investVehicles: existing.q?.investVehicles ?? 0,
    investInProgress: existing.q?.investInProgress ?? 0,
    electricityHours: existing.q?.electricityHours ?? 0,
    powerOutages: existing.q?.powerOutages ?? 0,
    energyDiesel: existing.q?.energyDiesel ?? 0,
    energyGas: existing.q?.energyGas ?? 0,
    energyGenerator: existing.q?.energyGenerator ?? 0,
    energyOther: existing.q?.energyOther ?? 0,
    nigeriaFirstComment: existing.q?.nigeriaFirstComment ?? "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(setStep) setStep(0);
    let manufacturerId = existing.m?.id;
    if (!manufacturerId) {
      const loc =
        NIGERIAN_STATES.find((s) => s.state === profile.state) ??
        NIGERIAN_STATES[0];
      const jitter = () => (Math.random() - 0.5) * 0.08;
      const m: Manufacturer = {
        id: manufacturers.length,
        ...profile,
        city: loc.city,
        lat: loc.lat + jitter(),
        lng: loc.lng + jitter(),
        createdAt: new Date().toISOString(),
      };
      addManufacturer(m);
      manufacturerId = m.id;
    }
    const q: PowerData = {
      id: existing.q?.id ?? `q-${Date.now()}`,
      manufacturerId,
      period: "H1 2026",
      ...form,
      startTime: form.startTime ?? new Date("2026-01-01"),
      endTime: form.endTime ?? new Date("2026-07-01"),
      submittedAt: new Date().toISOString(),
      submittedBy: "User"
    };
    upsertQuestionnaire(q);
    toast.success("Questionnaire submitted for H1 2026");
  };

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-5xl">
      <PageHeader
        title="MAN Economic Review Questionnaire"
        subtitle={`${startMonth} – ${endMonth} ${year}`}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Section title="A. Company Profile">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name of Company">
              <Input
                value={profile.company}
                onChange={(e) =>
                  setProfile({ ...profile, company: e.target.value })
                }
                required
              />
            </Field>
            <Field label="Contact Person">
              <Input
                value={profile.contactPerson}
                onChange={(e) =>
                  setProfile({ ...profile, contactPerson: e.target.value })
                }
                required
              />
            </Field>
            <Field label="E-mail">
              <Input
                type="email"
                value={profile.email}
                onChange={(e) =>
                  setProfile({ ...profile, email: e.target.value })
                }
                required
              />
            </Field>
            <Field label="Mobile Telephone Number(s)">
              <Input
                value={profile.phone}
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
                required
              />
            </Field>
            <Field label="Branch">
              <Input
                value={profile.branch}
                onChange={(e) =>
                  setProfile({ ...profile, branch: e.target.value })
                }
              />
            </Field>
            <Field label="State">
              <Select
                value={profile.state}
                onValueChange={(v) => setProfile({ ...profile, state: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from(new Set(NIGERIAN_STATES.map((s) => s.state))).map(
                    (s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Sectoral Group">
              <Select
                value={profile.sectoralGroup}
                onValueChange={(v) =>
                  setProfile({ ...profile, sectoralGroup: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SECTORAL_GROUPS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Sub-sector">
              <Input
                value={profile.subSector}
                onChange={(e) =>
                  setProfile({ ...profile, subSector: e.target.value })
                }
              />
            </Field>
          </div>
        </Section>

        <Section title="B. Manufacturing Core Indices">
          <div className="pt-2">
            <div className="text-sm font-medium mb-3">DATA PERIOD</div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
              <Field label="Start Date">
                <Input onChange={(e)=>{setStartTime(e.target.value)}} value={startTime} type="date" ></Input>
              </Field>
              <Field label="End Date">
                <Input onChange={(e)=>{setEndTime(e.target.value)}} value={endTime} type="date"></Input>
              </Field>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <NumField
              label="1. Capacity utilization (%)"
              value={form.capacityUtilization}
              onChange={(v) => setForm({ ...form, capacityUtilization: v })}
            />
            <NumField
              label="2. Estimated production value (₦)"
              value={form.productionValue}
              onChange={(v) => setForm({ ...form, productionValue: v })}
            />
            <NumField
              label="3. Cost of raw materials used (₦)"
              value={form.rawMaterialsCost}
              onChange={(v) => setForm({ ...form, rawMaterialsCost: v })}
            />
            <NumField
              label="4. Transport cost of raw materials (₦)"
              value={form.rawMaterialsTransport}
              onChange={(v) => setForm({ ...form, rawMaterialsTransport: v })}
            />
            <NumField
              label="5. Local sourcing of raw materials (%)"
              value={form.localSourcing}
              onChange={(v) => setForm({ ...form, localSourcing: v })}
            />
            <NumField
              label="6. Naira value of unsold finished goods"
              value={form.unsoldGoods}
              onChange={(v) => setForm({ ...form, unsoldGoods: v })}
            />
            <NumField
              label="7. New workers employed"
              value={form.newHires}
              onChange={(v) => setForm({ ...form, newHires: v })}
            />
            <NumField
              label={`8. Total workers as at ${endMonth} ${year}`}
              value={form.totalWorkers}
              onChange={(v) => setForm({ ...form, totalWorkers: v })}
            />
            <NumField
              label="9. Workers that left"
              value={form.workersLeft}
              onChange={(v) => setForm({ ...form, workersLeft: v })}
            />
            <NumField
              label="10. Average bank interest rate (%)"
              value={form.interestRate}
              onChange={(v) => setForm({ ...form, interestRate: v })}
            />
            <NumField
              label="11. Average exchange rate (₦/US$)"
              value={form.exchangeRate}
              onChange={(v) => setForm({ ...form, exchangeRate: v })}
            />
          </div>

          <div className="pt-2">
            <div className="text-sm font-medium mb-3">
              12. Investment spending on assets (₦)
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <NumField
                label="Land & Buildings"
                value={form.investLandBuildings}
                onChange={(v) => setForm({ ...form, investLandBuildings: v })}
              />
              <NumField
                label="Plant & Machinery"
                value={form.investPlant}
                onChange={(v) => setForm({ ...form, investPlant: v })}
              />
              <NumField
                label="Furniture & Equipment"
                value={form.investFurniture}
                onChange={(v) => setForm({ ...form, investFurniture: v })}
              />
              <NumField
                label="Motor Vehicle"
                value={form.investVehicles}
                onChange={(v) => setForm({ ...form, investVehicles: v })}
              />
              <NumField
                label="Assets in Progress"
                value={form.investInProgress}
                onChange={(v) => setForm({ ...form, investInProgress: v })}
              />
            </div>
          </div>
        </Section>

        <Section title="C. Manufacturing Energy Indicators">
          <div className="grid gap-4 sm:grid-cols-2">
            <NumField
              label="13. Avg hours of grid electricity per day"
              value={form.electricityHours}
              onChange={(v) => setForm({ ...form, electricityHours: v })}
            />
            <NumField
              label="14. Avg number of daily power outages"
              value={form.powerOutages}
              onChange={(v) => setForm({ ...form, powerOutages: v })}
            />
          </div>
          <div className="pt-2">
            <div className="text-sm font-medium mb-3">
              15. Alternative energy expenditure (₦)
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <NumField
                label="Diesel"
                value={form.energyDiesel}
                onChange={(v) => setForm({ ...form, energyDiesel: v })}
              />
              <NumField
                label="Gas"
                value={form.energyGas}
                onChange={(v) => setForm({ ...form, energyGas: v })}
              />
              <NumField
                label="Generator maint. & parts"
                value={form.energyGenerator}
                onChange={(v) => setForm({ ...form, energyGenerator: v })}
              />
              <NumField
                label="Others"
                value={form.energyOther}
                onChange={(v) => setForm({ ...form, energyOther: v })}
              />
            </div>
          </div>
          <Field
            label={`Comment on the "Nigeria First" policy's influence on government patronage of your products`}
          >
            <Textarea
              rows={4}
              value={form.nigeriaFirstComment}
              onChange={(e) =>
                setForm({ ...form, nigeriaFirstComment: e.target.value })
              }
            />
          </Field>
        </Section>

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Data is stored locally for this MVP. Nothing leaves your browser.
          </p>
          <Button type="submit" size="lg">
            <CheckCircle2 className="w-4 h-4 mr-2" /> Submit questionnaire
          </Button>
        </div>
      </form>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-6 space-y-5">
      <h2 className="font-display font-semibold text-lg text-primary">
        {title}
      </h2>
      {children}
    </Card>
  );
}
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}
function NumField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <Field label={label}>
      <Input
        type="number"
        min={0}
        step="any"
        value={value || ""}
        onChange={(e) => onChange(num(e.target.value))}
      />
    </Field>
  );
}
