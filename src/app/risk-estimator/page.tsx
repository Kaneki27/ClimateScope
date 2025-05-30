
import { RiskEstimatorForm } from "./risk-estimator-form";
import { ShieldAlert } from "lucide-react";

export default function RiskEstimatorPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-primary flex items-center gap-3">
            <ShieldAlert className="w-9 h-9 lg:w-10 lg:h-10" /> Climate Risk Estimator
          </h1>
          <p className="text-muted-foreground mt-1 text-base">
            Assess climate vulnerability and get tailored resilience suggestions using AI-powered analysis.
          </p>
        </div>
      </div>
      <RiskEstimatorForm />
    </div>
  );
}
