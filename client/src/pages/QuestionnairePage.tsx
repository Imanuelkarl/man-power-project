import { useState } from "react";
import { Sparkles, BarChart3, Landmark, Zap } from "lucide-react";
import { StepNavigator, type StepNavigatorStep } from "./StepNavigator";
import {
  QuestionnaireForm,
  QUESTIONNAIRE_STEPS,
} from "./manufacturers/QuestionnaireForm";
import { useNavigate } from "react-router-dom";

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
    description:
      "Production, workforce, and cost indicators for this period.",
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
    id: "review",
    label: "Review",
    sublabel: "Review Submission",
    icon: <Zap className="h-4 w-4" />,
    heading: "Review and Verify your data before submission",
  },
];

function QuestionnairePage() {
  const [step, setStep] = useState<number>(QUESTIONNAIRE_STEPS.WELCOME);
  const navigate = useNavigate();

  return (
    <StepNavigator
      steps={steps}
      currentStep={step}
      title="MAN Power Questionnaire Form"
      subtitle="Follow the simple 4 steps to complete your mapping."
      backLabel="Return to Submissions"
      onBack={()=>navigate("/submissions")}
      onStepClick={setStep}
    >
      <QuestionnaireForm currentStep={step} setStep={setStep} />
    </StepNavigator>
  );
}

export default QuestionnairePage;