import { useEffect, useMemo, useState } from "react";
import { useData, type PowerData } from "../../lib/store";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Navigate from "../../components/navigate";
import { formatPower } from "../../lib/format";
import { useParams } from "react-router-dom";

const num = (v: string) => (v === "" ? 0 : Number(v));
const currencySymbols: Record<string, string> = {
  NGN: "₦",
  USD: "$",
  GBP: "£",
  EUR: "€",
  CNY: "¥",
  ZAR: "R",
};
const getMonthFromDate = (date: string, subtractOneDay = false) => {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  if (subtractOneDay) {
    parsed.setDate(parsed.getDate() - 1);
  }
  return parsed.toLocaleString("default", { month: "long" });
};

/** Step indices this form understands. Keep in sync with the `steps` array passed to <StepNavigator>. */
export const QUESTIONNAIRE_STEPS = {
  WELCOME: 0,
  INDICES: 1,
  INVESTMENT: 2,
  ENERGY: 3,
  ENERGY_GENERATION: 4,
  REVIEW: 5,
} as const;
export const QUESTIONNAIRE_STEP_COUNT = 6;

interface QuestionnaireFormProps {
  currentStep: number;
  setStep: (step: number) => void;
}

export function QuestionnaireForm({
  currentStep,
  setStep,
}: QuestionnaireFormProps) {
  const { user } = useAuth();
  const [startMonth, setStartMonth] = useState("January");
  const [endMonth, setEndMonth] = useState("June");
  const [startTime, setStartTime] = useState("2026-01-01");
  const [endTime, setEndTime] = useState("2026-07-01");
  const [year, setYear] = useState(new Date().getFullYear());
  const [currency, setCurrency] = useState("NGN");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const {
    manufacturers,
    questionnaires,
    fetchQuestionnaires,
    createQuestionnaire,
    updateQuestionnaire,
  } = useData();
  const { id } = useParams();

  useEffect(() => {
    void fetchQuestionnaires();
  }, [fetchQuestionnaires]);

  const existing = useMemo(() => {
    if (user?.email) {
      const m = manufacturers.find((x) => x.email === user.email);
      const q = questionnaires.find((x) => String(x.id) === id);
      return { m, q };
    }
    return { m: undefined, q: undefined };
  }, [manufacturers, questionnaires, user?.email]);

  useEffect(() => {
    setStartMonth(getMonthFromDate(startTime));
    setEndMonth(getMonthFromDate(endTime, true));
    setYear(new Date(startTime).getFullYear());
  }, [startTime, endTime]);

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
    totalEnergyGenerated: existing.q?.totalEnergyGenerated ?? 0,
    totalEnergyConsumed: existing.q?.totalEnergyConsumed ?? 0,
    energyGeneratedByGas: existing.q?.energyGeneratedByGas ?? 0,
    energyGeneratedByDiesel: existing.q?.energyGeneratedByDiesel ?? 0,
    energyGeneratedByGenerator: existing.q?.energyGeneratedByGenerator ?? 0,
    energyGeneratedByOther: existing.q?.energyGeneratedByOther ?? 0,
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

  const saveQuestionnaire = async (status: "draft" | "submitted") => {
    if (!user) return;
    const manufacturerId = existing.m?.manId;
    if (!manufacturerId) {
      toast.error(
        "Complete your company profile in Settings before saving questionnaire data.",
      );
      return;
    }

    const payload: Omit<PowerData, "id"> = {
      manufacturerId,
      period: "H1 2026",
      ...form,
      startTime: form.startTime ?? new Date("2026-01-01"),
      endTime: form.endTime ?? new Date("2026-07-01"),
      status,
      submittedAt: status === "submitted" ? new Date().toISOString() : "",
      submittedBy: String(user.id),
    };

    setSaving(true);
    try {
      if (existing.q?.id !== undefined) {
        await updateQuestionnaire(existing.q.id, payload);
      } else {
        await createQuestionnaire(payload);
      }
      toast.success(
        status === "submitted"
          ? existing.q?.status === "draft"
            ? "Questionnaire submitted for H1 2026"
            : existing.q?.id !== undefined
              ? "Questionnaire updated"
              : "Questionnaire submitted for H1 2026"
          : "Questionnaire saved as draft",
      );
      setShowConfirmDialog(false);
      if (status === "submitted") setStep(QUESTIONNAIRE_STEPS.WELCOME);
    } catch {
      toast.error("Unable to save questionnaire data. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep === QUESTIONNAIRE_STEPS.REVIEW) {
      void saveQuestionnaire("submitted");
    }
  };

  if (!user) return <Navigate to="/login" />;

  const goNext = () =>
    setStep(Math.min(currentStep + 1, QUESTIONNAIRE_STEP_COUNT - 1));
  const goBack = () => setStep(Math.max(currentStep - 1, 0));

  return (
    <div className="max-w-3xl">
      {currentStep === QUESTIONNAIRE_STEPS.WELCOME && (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground leading-relaxed">
            This questionnaire covers your manufacturing core indices and energy
            indicators for{" "}
            <span className="font-medium text-foreground">
              {startMonth} – {endMonth} {year}
            </span>
            . It takes about 10 minutes. Your company profile is managed
            separately under Settings, so we'll go straight into production,
            investment, and energy data.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 max-w-sm">
            <Field label="Period start">
              <Input
                type="date"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </Field>
            <Field label="Period end">
              <Input
                type="date"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </Field>
            <Field label="Currency">
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="NGN">Nigerian Naira (NGN)</option>
                <option value="USD">US Dollar (USD)</option>
                <option value="GBP">British Pound (GBP)</option>
                <option value="EUR">Euro (EUR)</option>
                <option value="CNY">Chinese Yuan (CNY)</option>
                <option value="ZAR">South African Rand (ZAR)</option>
              </select>
            </Field>
          </div>
          <Button type="button" size="lg" onClick={goNext}>
            Get started <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}

      {currentStep > QUESTIONNAIRE_STEPS.WELCOME && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {currentStep === QUESTIONNAIRE_STEPS.INDICES && (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <NumField
                  label="1. Capacity utilization (%)"
                  value={form.capacityUtilization}
                  onChange={(v) => setForm({ ...form, capacityUtilization: v })}
                />
                <NumField
                  label={`2. Estimated production value (${currencySymbols[currency]})`}
                  value={form.productionValue}

                  onChange={(v) => setForm({ ...form, productionValue: v })}
                />
                <NumField
                  label={`3. Cost of raw materials used (${currencySymbols[currency]})`}
                  value={form.rawMaterialsCost}

                  onChange={(v) => setForm({ ...form, rawMaterialsCost: v })}
                />
                <NumField
                  label={`4. Transport cost of raw materials (${currencySymbols[currency]})`}
                  value={form.rawMaterialsTransport}

                  onChange={(v) =>
                    setForm({ ...form, rawMaterialsTransport: v })
                  }
                />
                <NumField
                  label="5. Local sourcing of raw materials (%)"
                  value={form.localSourcing}
                  onChange={(v) => setForm({ ...form, localSourcing: v })}
                />
                <NumField
                  label={`6. Value of unsold finished goods (${currencySymbols[currency]})`}
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
                  label={`12. Average exchange rate (₦/${currency})`}
                  value={form.exchangeRate}
                  onChange={(v) => setForm({ ...form, exchangeRate: v })}
                />
              </div>
            </div>
          )}

          {currentStep === QUESTIONNAIRE_STEPS.INVESTMENT && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                12. Investment spending on assets (₦)
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
          )}

          {currentStep === QUESTIONNAIRE_STEPS.ENERGY && (
            <div className="space-y-5">
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
            </div>
          )}
          {currentStep === QUESTIONNAIRE_STEPS.ENERGY_GENERATION && (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <NumField
                  label="16. Total Power Generated(W)"
                  value={form.totalEnergyGenerated}
                  onChange={(v) =>
                    setForm({ ...form, totalEnergyGenerated: v })
                  }
                />
                <NumField
                  label="17. Energy Consumed (W)"
                  value={form.totalEnergyConsumed}
                  onChange={(v) => setForm({ ...form, totalEnergyConsumed: v })}
                />
              </div>
              <div className="pt-2">
                <div className="text-sm font-medium mb-3">
                  18. Alternative energy expenditure (₦)
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
                  <NumField
                    label="Energy From Diesel"
                    value={form.energyGeneratedByDiesel}
                    onChange={(v) =>
                      setForm({ ...form, energyGeneratedByDiesel: v })
                    }
                  />
                  <NumField
                    label="Energy From Gas"
                    value={form.energyGeneratedByGas}
                    onChange={(v) =>
                      setForm({ ...form, energyGeneratedByGas: v })
                    }
                  />
                  <NumField
                    label="Energy From Generator maint. & parts"
                    value={form.energyGeneratedByGenerator}
                    onChange={(v) =>
                      setForm({ ...form, energyGeneratedByGenerator: v })
                    }
                  />
                  <NumField
                    label="Energy From Others"
                    value={form.energyGeneratedByOther}
                    onChange={(v) =>
                      setForm({ ...form, energyGeneratedByOther: v })
                    }
                  />
                </div>
              </div>
            </div>
          )}
          {currentStep === QUESTIONNAIRE_STEPS.REVIEW && (
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Please review all the information below before submitting your
                questionnaire.
              </p>

              <div className="space-y-5">
                <div className="space-y-2">
                  <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    Period
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Start:</span>{" "}
                      <span className="ml-2">
                        {startMonth} {year}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">End:</span>{" "}
                      <span className="ml-2">
                        {endMonth} {year}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    Core Indices (Section 1-11)
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">
                        Capacity Utilization:
                      </span>{" "}
                      <span className="ml-2">{form.capacityUtilization}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Production Value:
                      </span>{" "}
                      <span className="ml-2">
                        {currencySymbols[currency]}
                        {form.productionValue.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Local Sourcing:
                      </span>{" "}
                      <span className="ml-2">{form.localSourcing}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Total Workers:
                      </span>{" "}
                      <span className="ml-2">{form.totalWorkers}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Interest Rate:
                      </span>{" "}
                      <span className="ml-2">{form.interestRate}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Currency:</span>{" "}
                      <span className="ml-2">{currency}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Exchange Rate:
                      </span>{" "}
                      <span className="ml-2">
                        ₦{form.exchangeRate.toLocaleString()}/{currency}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    Investment Spending (Section 12)
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">
                        Land & Buildings:
                      </span>{" "}
                      <span className="ml-2">
                        {currencySymbols[currency]}
                        {form.investLandBuildings.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Plant & Machinery:
                      </span>{" "}
                      <span className="ml-2">
                        {currencySymbols[currency]}
                        {form.investPlant.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Furniture & Equipment:
                      </span>{" "}
                      <span className="ml-2">
                        {currencySymbols[currency]}
                        {form.investFurniture.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Motor Vehicle:
                      </span>{" "}
                      <span className="ml-2">
                        {currencySymbols[currency]}
                        {form.investVehicles.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Assets in Progress:
                      </span>{" "}
                      <span className="ml-2">
                        {currencySymbols[currency]}
                        {form.investInProgress.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    Energy (Section 13-15)
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">
                        Grid Electricity Hours:
                      </span>{" "}
                      <span className="ml-2">
                        {form.electricityHours} hrs/day
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Power Outages:
                      </span>{" "}
                      <span className="ml-2">{form.powerOutages} per day</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Diesel Spending:
                      </span>{" "}
                      <span className="ml-2">
                        {currencySymbols[currency]}
                        {form.energyDiesel.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Gas Spending:
                      </span>{" "}
                      <span className="ml-2">
                        {currencySymbols[currency]}
                        {form.energyGas.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  {form.nigeriaFirstComment && (
                    <div className="mt-3 pt-3 border-t space-y-1">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                        Nigeria First Comment
                      </p>
                      <p className="text-sm italic">
                        {form.nigeriaFirstComment}
                      </p>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    Energy (Section 13-15)
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">
                        Total Power Generated
                      </span>{" "}
                      <span className="ml-2">
                        {formatPower(form.totalEnergyGenerated)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Total Power Used for Production:
                      </span>{" "}
                      <span className="ml-2">
                        {formatPower(form.totalEnergyConsumed)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Diesel Power:
                      </span>{" "}
                      <span className="ml-2">
                        {formatPower(form.energyGeneratedByDiesel)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Gas Power:</span>{" "}
                      <span className="ml-2">
                        {formatPower(form.energyGeneratedByGas)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <Button type="button" variant="outline" onClick={goBack}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>

            {currentStep === QUESTIONNAIRE_STEPS.ENERGY_GENERATION ? (
              <Button type="button" size="lg" onClick={goNext}>
                Review <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : currentStep === QUESTIONNAIRE_STEPS.REVIEW ? (
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={saving}
                  onClick={() => void saveQuestionnaire("draft")}
                >
                  Save as draft
                </Button>
                <Button
                  type="button"
                  size="lg"
                  disabled={saving}
                  onClick={() => setShowConfirmDialog(true)}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {existing.q?.id !== undefined
                    ? existing.q.status === "draft"
                      ? "Save & submit"
                      : "Update questionnaire"
                    : "Submit questionnaire"}
                </Button>
              </div>
            ) : (
              <Button type="button" size="lg" onClick={goNext}>
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>

          {currentStep === QUESTIONNAIRE_STEPS.ENERGY_GENERATION && (
            <p className="text-xs text-muted-foreground text-right">
              Drafts and submitted questionnaires are saved to the server.
            </p>
          )}
        </form>
      )}

      {showConfirmDialog && (
        <ConfirmDialog
          onConfirm={handleSubmit}
          onCancel={() => setShowConfirmDialog(false)}
        />
      )}
    </div>
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
  currency,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  currency?: string;
}) {
  return (
    <Field label={label}>
      <div className="relative">
        {currency && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {currency}
          </span>
        )}
        <Input
          type="number"
          min={0}
          step="any"
          value={value || ""}
          className={currency ? "pl-8" : undefined}
          onChange={(e) => onChange(num(e.target.value))}
        />
      </div>
    </Field>
  );
}

function ConfirmDialog({
  onConfirm,
  onCancel,
}: {
  onConfirm: (e: React.FormEvent) => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-[#000000]/60">
      <div className="rounded-lg shadow-lg max-w-sm w-full p-6 space-y-4 bg-[color:var(--color-card)] text-[color:var(--color-card-foreground)]">
        <div>
          <h2 className="text-lg font-semibold">Confirm Submission</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Are you sure you want to submit this questionnaire? Please ensure
            all information is accurate before confirming.
          </p>
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={(e) => {
              onConfirm(e);
            }}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" /> Yes, Submit
          </Button>
        </div>
      </div>
    </div>
  );
}
