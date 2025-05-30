
"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { climateRiskEstimator, type ClimateRiskEstimatorInput, type ClimateRiskEstimatorOutput } from "@/ai/flows/climate-risk-estimator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle2, Info, Loader2, ShieldAlert, Thermometer, Droplets, Wind, HeartPulse, UserSquare2, Waves } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  regionType: z.string().min(3, "Region type must be at least 3 characters long.").max(150, "Region type is too long."),
  localEmissionLevels: z.string().min(3, "Emission levels description must be at least 3 characters long.").max(200, "Emission levels description is too long."),
  vegetationCover: z.string().min(3, "Vegetation cover description must be at least 3 characters long.").max(200, "Vegetation cover description is too long."),
});

type FormData = z.infer<typeof formSchema>;

const ScoreDisplay = ({ title, score, icon: Icon }: { title: string; score?: number; icon: React.ElementType }) => {
  const displayScore = score ?? 0;
  let progressColorClass = "bg-primary"; // Default to primary (blueish)
  if (displayScore > 75) progressColorClass = "bg-destructive"; // Red for very high
  else if (displayScore > 50) progressColorClass = "bg-accent"; // Orange for high (using accent)
  else if (displayScore > 25) progressColorClass = "bg-yellow-500"; // Direct Tailwind yellow for moderate

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <FormLabel className="text-sm font-medium flex items-center gap-2"><Icon className="h-5 w-5 text-muted-foreground"/>{title}</FormLabel>
        <span className={cn("text-sm font-semibold", 
            displayScore > 75 ? 'text-destructive' : 
            displayScore > 50 ? 'text-accent' : // using accent variable
            displayScore > 25 ? 'text-yellow-600 dark:text-yellow-400' : // darker yellow for light, lighter for dark
            'text-primary'
        )}>
          {displayScore.toFixed(0)}/100
        </span>
      </div>
      <Progress value={displayScore} className={cn("h-2.5", progressColorClass)} />
    </div>
  );
};


export function RiskEstimatorForm() {
  const [result, setResult] = useState<ClimateRiskEstimatorOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      regionType: "",
      localEmissionLevels: "",
      vegetationCover: "",
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    setResult(null);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 800));
      const output = await climateRiskEstimator(data as ClimateRiskEstimatorInput);
      setResult(output);
      toast({
        title: "Risk Estimation Complete",
        description: "Climate Vulnerability Index and suggestions generated.",
        variant: "default",
      });
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred during estimation.";
      setError(`Failed to estimate risk: ${errorMessage}`);
      toast({
        title: "Estimation Error",
        description: `Failed to estimate risk: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={cn("w-full max-w-2xl mx-auto shadow-xl animate-fade-in-up")} style={{animationDelay: '0.2s'}}>
      <CardHeader>
        <CardTitle className="text-2xl">Regional Climate Risk Profile</CardTitle>
        <CardDescription>
          Enter details about your region to receive an AI-generated Climate Vulnerability Index (CVI) and tailored resilience actions.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6 py-6">
            <FormField
              control={form.control}
              name="regionType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="regionType" className="text-base">Region Type</FormLabel>
                  <FormControl>
                    <Input id="regionType" placeholder="e.g., Coastal megacity, Arid agricultural plains, Mountainous forest valley" {...field} className="text-base md:text-sm"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="localEmissionLevels"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="localEmissionLevels" className="text-base">Local Emission Sources & Levels</FormLabel>
                   <FormControl>
                    <Input id="localEmissionLevels" placeholder="e.g., High from heavy industry and traffic, Low - primarily residential with some commercial" {...field} className="text-base md:text-sm"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="vegetationCover"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="vegetationCover" className="text-base">Dominant Vegetation Cover</FormLabel>
                  <FormControl>
                    <Input id="vegetationCover" placeholder="e.g., Dense urban parks and green corridors, Sparse desert scrubland, Extensive monoculture agricultural lands" {...field} className="text-base md:text-sm"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col items-stretch gap-4 p-6">
            <Button type="submit" disabled={isLoading} className="w-full py-3 text-base font-semibold shadow-md hover:shadow-lg transition-shadow" size="lg">
              {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Estimating Risk...</> : "Estimate Climate Risk"}
            </Button>
            {error && (
              <Alert variant="destructive" className="mt-4 animate-fade-in-up">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardFooter>
        </form>
      </Form>

      {isLoading && !result && (
        <div className="p-6 border-t text-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">AI is analyzing your region's data... please wait.</p>
        </div>
      )}

      {result && !isLoading && (
        <div className="p-6 border-t animate-fade-in-up space-y-8">
          <h3 className="text-2xl font-semibold text-primary text-center">Estimation Results</h3>
          
          <Card className="bg-muted/30 shadow-lg hover:shadow-xl transition-all duration-300 ease-out hover:scale-[1.01]">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <ShieldAlert className="text-accent h-7 w-7"/>
                Overall Climate Vulnerability Index (CVI)
              </CardTitle>
            </CardHeader>
            <CardContent className="py-6">
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <Progress 
                    value={result.climateVulnerabilityIndex} 
                    className={cn("w-full h-8 rounded-lg", 
                        result.climateVulnerabilityIndex > 75 ? "bg-destructive" : 
                        result.climateVulnerabilityIndex > 50 ? "bg-accent" : 
                        result.climateVulnerabilityIndex > 25 ? "bg-yellow-500" : 
                        "bg-primary"
                    )}
                />
                <span className={cn("text-5xl font-bold whitespace-nowrap",
                    result.climateVulnerabilityIndex > 75 ? 'text-destructive' : 
                    result.climateVulnerabilityIndex > 50 ? 'text-accent' : 
                    result.climateVulnerabilityIndex > 25 ? 'text-yellow-600 dark:text-yellow-400' : 
                    'text-primary'
                )}>
                  {result.climateVulnerabilityIndex.toFixed(0)}
                  <span className="text-2xl text-muted-foreground">/100</span>
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-3 text-center sm:text-left">
                (0 = Least Vulnerable, 100 = Most Vulnerable, based on provided inputs)
              </p>
            </CardContent>
          </Card>

          {result.multiFactorScores && (
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 ease-out hover:scale-[1.01]">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Info className="text-primary h-7 w-7" />
                  Multi-Factor Risk Scorecard
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.multiFactorScores.seaLevelRiskScore !== undefined && (
                    <ScoreDisplay title="Sea Level Rise Impact" score={result.multiFactorScores.seaLevelRiskScore} icon={Waves} />
                )}
                <ScoreDisplay title="Drought & Flood Probability" score={result.multiFactorScores.droughtFloodProbabilityScore} icon={Droplets} />
                <ScoreDisplay title="AQI Trends & Pollution" score={result.multiFactorScores.aqiTrendScore} icon={Wind} />
                <ScoreDisplay title="Public Health Vulnerability" score={result.multiFactorScores.healthVulnerabilityScore} icon={HeartPulse} />
              </CardContent>
            </Card>
          )}
           <Card className="shadow-md bg-muted/20">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2"><Info className="text-blue-500 h-5 w-5"/>Conceptual Economic Impact</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Regions with a CVI around <strong className="text-foreground">{result.climateVulnerabilityIndex.toFixed(0)}</strong> may face increased climate-related economic impacts on infrastructure, agriculture, and health sectors. Climate insurance costs could also rise. This is a conceptual note; actual financial impact assessment requires detailed local analysis.
                    </p>
                </CardContent>
            </Card>


          {result.vulnerabilityPersonas && result.vulnerabilityPersonas.length > 0 && (
             <Card className="shadow-lg hover:shadow-xl transition-all duration-300 ease-out hover:scale-[1.01]">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <UserSquare2 className="text-primary h-7 w-7" />
                  AI-Generated Vulnerability Personas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.vulnerabilityPersonas.map((persona, index) => (
                  <Card key={index} className="bg-background/70 p-4 shadow-inner">
                    <h4 className="font-semibold text-md text-secondary mb-1">{persona.name}</h4>
                    <p className="text-sm text-muted-foreground">{persona.description}</p>
                  </Card>
                ))}
              </CardContent>
            </Card>
          )}
          
          <Card className="shadow-lg hover:shadow-xl transition-all duration-300 ease-out hover:scale-[1.01]">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <CheckCircle2 className="text-secondary h-7 w-7"/>
                AI-Suggested Resilience Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={result.suggestedActions}
                readOnly
                rows={10}
                className="bg-background/70 text-sm leading-relaxed p-4 rounded-md shadow-inner"
              />
              <p className="text-xs text-muted-foreground mt-3">These are AI-generated suggestions. Consult with local experts for detailed planning and implementation.</p>
            </CardContent>
          </Card>
        </div>
      )}
    </Card>
  );
}
