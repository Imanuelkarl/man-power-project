import { useState } from "react";
import {
  Sparkles,
  BarChart3,
  Landmark,
  Zap,
  PlugZapIcon,
  Eye,
} from "lucide-react";
import { StepNavigator, type StepNavigatorStep } from "../StepNavigator";
import { QuestionnaireForm, QUESTIONNAIRE_STEPS } from "./QuestionnaireForm";
import { useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const steps: StepNavigatorStep[] = [
  {
    id: "welcome",
    label: "Welcome",
    sublabel: "Get started",
    icon: <Sparkles className="h-4 w-4" />,
    heading: "MAN Economic Review Questionnaire",
    description:
      "A quick overview before you begin. Your company profile is managed under Settings.",
  },
  {
    id: "indices",
    label: "Core Indices",
    sublabel: "Section B",
    icon: <BarChart3 className="h-4 w-4" />,
    heading: "Manufacturing Core Indices",
    description: "Production, workforce, and cost indicators for this period.",
  },
  {
    id: "investment",
    label: "Investment",
    sublabel: "Section B",
    icon: <Landmark className="h-4 w-4" />,
    heading: "Investment in Assets",
    description: "Spending on land, machinery, and other capital assets.",
  },
  {
    id: "energy",
    label: "Energy",
    sublabel: "Section C",
    icon: <Zap className="h-4 w-4" />,
    heading: "Manufacturing Energy Indicators",
    description: "Grid electricity, outages, and alternative energy costs.",
  },

  {
    id: "power",
    label: "Power",
    sublabel: "Section D",
    icon: <PlugZapIcon className="h-4 w-4" />,
    heading: "Manufacturing Power Data",
    description: "Grid electricity, outages, and alternative energy costs.",
  },
  {
    id: "review",
    label: "Review",
    sublabel: "Review Submission",
    icon: <Eye className="h-4 w-4" />,
    heading: "Review and Verify your data before submission",
  },
];

function QuestionnairePage() {
  const [step, setStep] = useState<number>(QUESTIONNAIRE_STEPS.WELCOME);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  return (
    <StepNavigator
      steps={steps}
      currentStep={step}
      title="MAN Power Questionnaire Form"
      subtitle="Follow the simple 4 steps to complete your mapping."
      backLabel={isAdmin ? "Return to Manufacturers" : "Return to Submissions"}
      onBack={() => navigate(isAdmin ? "/manufacturers" : "/submissions")}
      onStepClick={setStep}
    >
      <QuestionnaireForm
        key={
          searchParams.get("manufacturerId") ?? searchParams.get("id") ?? "new"
        }
        currentStep={step}
        setStep={setStep}
      />
    </StepNavigator>
  );
}

export default QuestionnairePage;
