
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Thermometer, Droplets, Waves, Sun, Leaf, ShieldCheck, AlertTriangle, BarChart3, Map, Loader2 } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const getRandomElement = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomElements = <T,>(arr: T[], count: number): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
};

const sampleKeyRisksPool = [
  "Increased frequency, intensity, and duration of heatwaves impacting public health, vulnerable populations, energy demand, and worker productivity.",
  "Water scarcity due to prolonged droughts, altered rainfall patterns, increased evapotranspiration, and declining snowpack/glacier melt in relevant regions.",
  "Coastal inundation, accelerated erosion, and saltwater intrusion into freshwater aquifers resulting from sea-level rise and more intense storm surges.",
  "Disruption to agricultural yields, fisheries, and overall food security due to changing temperatures, water availability, extreme events, and pest/disease patterns.",
  "Damage to critical infrastructure (transport networks, energy grids, water systems, communication lines, healthcare facilities) from extreme weather events like floods, storms, and wildfires.",
  "Increased risk and geographical spread of vector-borne (e.g., malaria, dengue, Lyme disease) and water-borne diseases.",
  "Significant loss of biodiversity, ecosystem degradation (e.g., coral bleaching, forest dieback), and shifts in species distribution affecting natural resources and ecosystem services.",
  "More frequent, larger, and more severe wildfires threatening communities, habitats, air quality, and water catchments.",
  "Urban flooding (pluvial and fluvial) due to overwhelmed drainage systems during heavy rainfall, increased impervious surfaces, and changes in river flows.",
  "Negative impacts on tourism and recreation-based economies due to environmental changes, loss of attractions, and extreme events.",
  "Supply chain disruptions for essential goods and services due to local, regional, and global climate-related disasters.",
  "Exacerbation of social inequities, as climate impacts disproportionately affect vulnerable and marginalized populations (low-income, elderly, indigenous communities).",
  "Impacts on human migration and displacement, leading to increased pressure on resources and social services in receiving areas.",
  "Ocean acidification threatening marine ecosystems, particularly shellfish and coral reefs, with cascading effects on fisheries.",
  "Mental health impacts from climate anxiety, displacement, loss of livelihoods, and trauma from disaster exposure.",
];

const sampleMitigationAdvicePool = [
  "Accelerate the transition to a 100% renewable energy system, prioritizing solar, wind, geothermal, and sustainable bioenergy, coupled with grid modernization and energy storage solutions.",
  "Implement stringent energy efficiency standards and retrofitting programs across all sectors: buildings (residential, commercial, industrial), transport, and industry.",
  "Invest massively in and expand sustainable public transportation options (rail, bus rapid transit), cycling infrastructure, and pedestrian-friendly urban design to reduce reliance on private vehicles.",
  "Protect, restore, and sustainably manage forests, wetlands, mangroves, peatlands, and grasslands as crucial carbon sinks and biodiversity havens ('Nature-based Solutions').",
  "Promote and incentivize sustainable land management, agroforestry, regenerative agricultural practices (e.g., no-till farming, cover cropping, integrated livestock management) to enhance soil carbon sequestration and reduce agricultural emissions.",
  "Support research, development, and responsible deployment of carbon capture, utilization, and storage (CCUS) technologies for hard-to-abate industrial sectors, ensuring environmental safeguards.",
  "Foster circular economy models to reduce waste, improve resource efficiency, minimize emissions from production and consumption, and promote product longevity and recyclability.",
  "Implement effective carbon pricing mechanisms (e.g., carbon tax, emissions trading systems) that reflect the true social cost of carbon and incentivize economy-wide emissions reductions.",
  "Phase out fossil fuel subsidies and redirect financial flows towards climate solutions, green infrastructure, and just transition initiatives.",
  "Strengthen international cooperation, technology transfer, and financial support (e.g., Green Climate Fund) for climate action in developing and vulnerable countries.",
  "Promote sustainable consumption patterns through public awareness campaigns, education, and policies that encourage lower-impact choices (e.g., plant-rich diets, reduced air travel).",
  "Integrate climate change considerations into all levels of policy-making, financial planning, and investment decisions.",
];

const sampleAdaptationHighlightsPool = [
    "Development and implementation of comprehensive, multi-hazard early warning systems that are accessible and actionable for all communities, integrating climate projections.",
    "Investment in climate-resilient infrastructure, including upgrading coastal defenses (e.g., sea walls, living shorelines, dune restoration), reinforcing transport and energy networks, and climate-proofing water and sanitation systems.",
    "Promotion of water conservation and efficiency measures across all sectors, development and adoption of drought-resistant crop varieties, and implementation of integrated water resource management plans that account for climate change.",
    "Expansion of urban greening projects (e.g., city parks, green roofs, urban forests, permeable pavements) to mitigate urban heat island effects, improve air quality, manage stormwater, and enhance biodiversity.",
    "Strengthening community engagement programs for climate literacy, participatory risk assessment, local adaptation planning, and preparedness drills, ensuring the inclusion of vulnerable and marginalized groups.",
    "Diversification of local economies and livelihoods to reduce dependence on climate-sensitive sectors (e.g., rain-fed agriculture, coastal tourism) and build adaptive capacity through skills development and alternative income generation.",
    "Enhancement of ecosystem-based adaptation (EbA) measures, such as mangrove restoration for coastal protection, reforestation for slope stabilization and water regulation, and conservation of wetlands for flood mitigation.",
    "Investment in robust climate research, observation systems, and local impact modeling to inform adaptive management, policy decisions, and long-term planning.",
    "Revision and enforcement of climate-resilient building codes, land-use planning regulations, and infrastructure standards to ensure new developments and retrofits can withstand future climate impacts.",
    "Development of climate-smart agricultural practices, including precision irrigation, soil health improvement, crop rotation, and access to climate information services for farmers.",
    "Establishment of social safety nets and adaptive social protection programs to support communities affected by climate-related shocks and stresses, including insurance schemes and cash transfers.",
];


interface ReportData {
  location: string;
  reportTitle: string;
  dateGenerated: string;
  currentTrends: {
    temperature: string;
    precipitation: string;
    seaLevel?: string; 
    extremeEvents: string;
    co2Concentration: string; 
  };
  futureProjections2050: {
    scenario: string;
    temperature: string;
    precipitation: string;
    seaLevel?: string; 
    floodRisk: string;
    droughtRisk: string;
    wildfireRisk: string; 
  };
  keyRisks: string[];
  mitigationAdvice: string[];
  adaptationHighlights: string[];
  imageSeedTrend: string; 
  imageSeedRisk: string;
  trendImageHint: string;
  riskImageHint: string;  
}

const generateReportData = (location: string, reportType: string, scenario: string): ReportData => {
  const isCoastal = reportType === "city" ? Math.random() > 0.3 : Math.random() > 0.2; 
  const currentYear = new Date().getFullYear();
  const baseYearHistorical = 1950 + Math.floor(Math.random() * 30); 

  const trendsTemperature = `Average +${(Math.random() * 2.0 + 0.5).toFixed(1)}°C increase compared to ${baseYearHistorical}-${baseYearHistorical+25} baseline. Accelerated warming observed in recent decades, with more frequent record high temperatures.`;
  const trendsPrecipitation = `${(Math.random() * 25 + 5).toFixed(0)}% ${getRandomElement(["increase in the intensity of heavy precipitation events", "marked decrease in overall annual rainfall, particularly during key seasons", "significant shift in seasonal rainfall patterns, impacting water cycles", "more erratic and unpredictable distribution of rainfall, with longer dry spells"])}.`;
  
  const sspScenariosDetails: {[key: string]: {tempRange: [number, number], slrMultiplier: number, riskFactor: number, description: string}} = {
    "SSP1-2.6": { tempRange: [1.6, 2.3], slrMultiplier: 0.75, riskFactor: 0.65, description: "Low Emissions, High Resilience & Sustainability Pathway"},
    "SSP2-4.5": { tempRange: [2.4, 3.5], slrMultiplier: 1.0, riskFactor: 1.0, description: "Medium Emissions, Moderate Resilience & 'Middle of the Road' Pathway"},
    "SSP3-7.0": { tempRange: [3.4, 4.8], slrMultiplier: 1.35, riskFactor: 1.35, description: "High Emissions, Low Resilience & Regional Rivalry Pathway"},
    "SSP5-8.5": { tempRange: [4.3, 6.0], slrMultiplier: 1.7, riskFactor: 1.7, description: "Very High Emissions, Fossil-fueled Development & High Inequality Pathway"}
  };
  const selectedScenarioDetails = sspScenariosDetails[scenario] || sspScenariosDetails["SSP2-4.5"];

  const projTempMin = selectedScenarioDetails.tempRange[0] + (Math.random() * 0.5 - 0.25);
  const projTempMax = selectedScenarioDetails.tempRange[1] + (Math.random() * 0.7 - 0.35);
  const projTemperature = `Projected average increase of +${projTempMin.toFixed(1)}°C to +${projTempMax.toFixed(1)}°C relative to pre-industrial levels. Expect significantly more frequent and intense heatwaves, and warmer winters.`;
  
  const projPrecipitationPatterns = [
    "Increased frequency and intensity of extreme rainfall events, leading to substantially higher flood risk, alternating with longer and more severe multi-year dry spells in many regions.",
    "Significant and potentially disruptive shifts in seasonal rainfall patterns, profoundly impacting water resource availability for agriculture, industry, ecosystems, and domestic use.",
    "Greater year-to-year and decadal variability in precipitation, making long-term water management, agricultural planning, and infrastructure design extremely challenging and uncertain.",
    `Overall ${Math.random() > 0.5 ? 'reduction' : 'increase'} in mean annual rainfall for ${location} region, with pronounced regional and sub-regional differences, and complex impacts on hydrology and water balance.`
  ];

  const riskLevels = ["Low", "Moderate", "Elevated", "High", "Very High", "Critical", "Extreme"];
  const getRiskLevel = (baseFactor: number) => riskLevels[Math.min(riskLevels.length - 1, Math.floor(Math.random() * 2.5 + baseFactor * selectedScenarioDetails.riskFactor))];

  const uniqueSeedSuffix = Date.now() + Math.random().toString(36).substring(2, 8);
  
  const trendImageHint = "temperature graph";
  const riskImageHint = isCoastal ? "coastal hazard" : "hazard map";

  return {
    location: `${location} (${reportType === "city" ? "City/Regional Focus Area" : "National/Broad Regional Overview"})`,
    reportTitle: `Climate Trajectory & Resilience Insights: ${location}`,
    dateGenerated: new Date().toLocaleString([], { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    currentTrends: {
      temperature: trendsTemperature,
      precipitation: trendsPrecipitation,
      seaLevel: isCoastal ? `${(Math.random() * 12 + 3).toFixed(0)} cm rise observed since ${baseYearHistorical + 30}, with clear signs of accelerated rise in the last 10-15 years.` : undefined,
      extremeEvents: `Notable increase in frequency and/or intensity of ${getRandomElement(["heatwave days and nights", "heavy precipitation events leading to flash floods", "coastal storm intensity and related surge heights", "wildfire risk days and overall fire season length", "urban flash floods due to overwhelmed drainage", "prolonged agricultural and hydrological droughts"])} observed in the last 20-30 years.`,
      co2Concentration: `Current global atmospheric CO₂ levels, a primary driver of observed changes: approx. ${(418 + Math.random()*7).toFixed(0)} ppm (latest data, Mauna Loa Observatory). This is significantly above pre-industrial levels.`
    },
    futureProjections2050: {
      scenario: `Based on IPCC Shared Socioeconomic Pathway ${scenario} (${selectedScenarioDetails.description})`,
      temperature: projTemperature,
      precipitation: getRandomElement(projPrecipitationPatterns),
      seaLevel: isCoastal ? `Additional ${(Math.random() * 30 + 10 * selectedScenarioDetails.slrMultiplier).toFixed(0)}-${(Math.random() * 40 + 25 * selectedScenarioDetails.slrMultiplier).toFixed(0)} cm rise anticipated by mid-century, greatly exacerbating coastal hazards such as erosion, inundation, and saltwater intrusion.` : undefined,
      floodRisk: `Projected ${getRiskLevel(2.5)} risk from riverine, pluvial, and/or coastal flooding, particularly in low-lying, poorly drained, and densely urbanized areas. Critical infrastructure may be regularly impacted.`,
      droughtRisk: `Anticipated ${getRiskLevel(2)} risk of meteorological, agricultural, and/or hydrological drought, with severe implications for water security, food production, and ecosystem health.`,
      wildfireRisk: `Expected ${getRiskLevel(1.5)} risk of wildfires, influenced by changes in vegetation, increased temperatures, prolonged dry spells, and human activity. Potential for larger and more intense fires.`,
    },
    keyRisks: getRandomElements(sampleKeyRisksPool, Math.floor(Math.random() * 3) + 5), 
    mitigationAdvice: getRandomElements(sampleMitigationAdvicePool, Math.floor(Math.random() * 3) + 6), 
    adaptationHighlights: getRandomElements(sampleAdaptationHighlightsPool, Math.floor(Math.random() * 2) + 4), 
    imageSeedTrend: `${location.replace(/\s+/g, '')}Trend${uniqueSeedSuffix}`,
    imageSeedRisk: `${location.replace(/\s+/g, '')}Risk${uniqueSeedSuffix}`,
    trendImageHint,
    riskImageHint,
  };
};


export default function ReportGeneratorPage() {
  const [location, setLocation] = useState("");
  const [reportType, setReportType] = useState("city");
  const [scenario, setScenario] = useState("SSP2-4.5"); 
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateReport = () => {
    if (!location) {
       toast({
        title: "Input Required",
        description: "Please enter a location name (e.g., city or country).",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    setReportData(null); 

    setTimeout(() => {
      const newReportData = generateReportData(location, reportType, scenario);
      setReportData(newReportData);
      setLoading(false);
      toast({
        title: "Report Generated Successfully!",
        description: `Climate trajectory report for ${location} (${scenario}) is ready for review.`,
      });
    }, 1800 + Math.random() * 700);
  };

  const handleDownloadPdf = () => {
    toast({
      title: "Download PDF Initiated (Simulated)",
      description: "Your report is being prepared for download. This feature is illustrative and does not generate a real PDF in this demo.",
      variant: "default",
    });
    
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "PDF Ready (Simulated)",
        description: `Climate_Report_for_${(reportData?.location.split(" (")[0].replace(/\s+/g, '_') || "Location")}_${scenario}.pdf would be downloaded here.`,
      });
    }, 2500);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in-up">
         <div>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-primary">Climate Report Generator</h1>
            <p className="text-muted-foreground mt-1">Generate a custom climate trajectory report with simulated data insights and visualizations.</p>
        </div>
      </div>

      <Card className="shadow-xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl"><FileText className="text-primary h-7 w-7"/>Report Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="locationInput" className="block text-sm font-medium text-foreground mb-1.5">City or Country Name</label>
              <Input
                id="locationInput"
                type="text"
                placeholder="e.g., New York City or USA"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                
              />
            </div>
            <div>
              <label htmlFor="reportTypeSelect" className="block text-sm font-medium text-foreground mb-1.5">Report Scope</label>
              <Select value={reportType} onValueChange={(value) => setReportType(value)}>
                <SelectTrigger id="reportTypeSelect" className="shadow-sm">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="city">City/Regional Report</SelectItem>
                  <SelectItem value="country">National Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="scenarioSelect" className="block text-sm font-medium text-foreground mb-1.5">Projection Scenario (IPCC SSP)</label>
              <Select value={scenario} onValueChange={(value) => setScenario(value)}>
                <SelectTrigger id="scenarioSelect" className="shadow-sm">
                  <SelectValue placeholder="Select projection scenario" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SSP1-2.6">SSP1-2.6 (Sustainability)</SelectItem>
                  <SelectItem value="SSP2-4.5">SSP2-4.5 (Middle Road)</SelectItem>
                  <SelectItem value="SSP3-7.0">SSP3-7.0 (Regional Rivalry)</SelectItem>
                  <SelectItem value="SSP5-8.5">SSP5-8.5 (Fossil-fueled Dev.)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleGenerateReport} disabled={loading || !location} size="lg" className="w-full md:w-auto shadow-md hover:shadow-lg transition-shadow">
            {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin"/> Generating Report...</> : "Generate Climate Report"}
          </Button>
        </CardContent>
      </Card>
      
      {loading && !reportData && (
        <Card className="shadow-xl text-center py-12 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
                <CardTitle className="text-2xl">Generating your climate report for {location}...</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center">
                    <FileText className="w-20 h-20 text-primary mb-6 animate-pulse" />
                    <p className="text-muted-foreground text-lg">Analyzing climate models and compiling data... (Simulated)</p>
                    <Loader2 className="w-8 h-8 text-primary mt-4 animate-spin"/>
                </div>
            </CardContent>
        </Card>
      )}

      {reportData && !loading && (
        <Card className="shadow-2xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6">
            <div>
              <CardTitle className="text-2xl lg:text-3xl text-primary">{reportData.reportTitle}</CardTitle>
              <CardDescription className="text-base">Generated on: {reportData.dateGenerated} (Simulated Data based on IPCC Frameworks)</CardDescription>
            </div>
            <Button variant="outline" size="lg" onClick={handleDownloadPdf} disabled={loading} className="w-full sm:w-auto shadow-md hover:shadow-lg transition-shadow">
              <Download className="mr-2 h-5 w-5" />
              Download PDF (Simulated)
            </Button>
          </CardHeader>
          <CardContent className="space-y-8 pt-6 p-6">
            <ReportSection title="Current Climate Trends & Observations" icon={Thermometer}>
              <p><strong>Temperature Trends:</strong> {reportData.currentTrends.temperature}</p>
              <p><strong>Precipitation Patterns:</strong> {reportData.currentTrends.precipitation}</p>
              {reportData.currentTrends.seaLevel && <p><strong>Sea Level Change:</strong> {reportData.currentTrends.seaLevel}</p>}
              <p><strong>Extreme Weather Events:</strong> {reportData.currentTrends.extremeEvents}</p>
              <p><strong>Atmospheric CO₂ Context:</strong> {reportData.currentTrends.co2Concentration}</p>
            </ReportSection>
            
            <ReportSection title={`Future Projections (Towards 2050 - ${reportData.futureProjections2050.scenario})`} icon={Sun}>
              <p><strong>Temperature Outlook:</strong> {reportData.futureProjections2050.temperature}</p>
              <p><strong>Precipitation Outlook:</strong> {reportData.futureProjections2050.precipitation}</p>
              {reportData.futureProjections2050.seaLevel && <p><strong>Sea Level Outlook:</strong> {reportData.futureProjections2050.seaLevel}</p>}
              <p><strong>Projected Flood Risk:</strong> {reportData.futureProjections2050.floodRisk}</p>
              <p><strong>Projected Drought Risk:</strong> {reportData.futureProjections2050.droughtRisk}</p>
              <p><strong>Projected Wildfire Risk:</strong> {reportData.futureProjections2050.wildfireRisk}</p>
              <div className="mt-6 grid md:grid-cols-2 gap-6">
                 <div className="h-72 bg-muted/70 rounded-xl flex flex-col items-center justify-center p-4 shadow-inner overflow-hidden">
                    <h4 className="text-md font-semibold text-muted-foreground mb-2">Conceptual Temperature Trend Visualization</h4>
                    {reportData.imageSeedTrend && <Image 
                        src={`https://placehold.co/400x220.png?text=Trend&seed=${reportData.imageSeedTrend}`}
                        alt="Temperature Trend Chart Placeholder"
                        width={400}
                        height={220}
                        className="rounded-lg object-contain transition-transform duration-500 hover:scale-105"
                        data-ai-hint={reportData.trendImageHint}
                        key={reportData.imageSeedTrend} 
                    />}
                 </div>
                 <div className="h-72 bg-muted/70 rounded-xl flex flex-col items-center justify-center p-4 shadow-inner overflow-hidden">
                    <h4 className="text-md font-semibold text-muted-foreground mb-2">Conceptual Hazard Hotspots Map</h4>
                    {reportData.imageSeedRisk && <Image 
                        src={`https://placehold.co/400x220.png?text=Risk+Map&seed=${reportData.imageSeedRisk}`}
                        alt="Flood Risk Map Placeholder"
                        width={400}
                        height={220}
                        className="rounded-lg object-contain transition-transform duration-500 hover:scale-105"
                        data-ai-hint={reportData.riskImageHint}
                        key={reportData.imageSeedRisk}
                    />}
                 </div>
              </div>
               <p className="text-xs text-muted-foreground mt-2 text-center">Note: Visualizations are conceptual placeholders. Actual data representation requires specific geospatial and climate model outputs.</p>
            </ReportSection>

            <ReportSection title="Key Climate-Related Risks Identified" icon={AlertTriangle}>
              <ul className="list-disc list-inside space-y-1.5 columns-1 lg:columns-2">
                {reportData.keyRisks.map((risk, index) => <li key={index}>{risk}</li>)}
              </ul>
            </ReportSection>
            
            <ReportSection title="Highlighted Adaptation Measures & Strategies" icon={ShieldCheck}>
              <ul className="list-disc list-inside space-y-1.5">
                {reportData.adaptationHighlights.map((advice, index) => <li key={index}>{advice}</li>)}
              </ul>
            </ReportSection>

            <ReportSection title="Suggested Mitigation Efforts & Long-Term Resilience Pathways" icon={Leaf}>
              <ul className="list-disc list-inside space-y-1.5 columns-1 lg:columns-2">
                {reportData.mitigationAdvice.map((advice, index) => <li key={index}>{advice}</li>)}
              </ul>
            </ReportSection>
          </CardContent>
           <CardFooter className="p-6 bg-muted/50 rounded-b-xl">
            <p className="text-xs text-muted-foreground leading-relaxed">Disclaimer: This report is generated using simulated data based on generalized climate models and IPCC Shared Socioeconomic Pathways for educational and awareness purposes. It is not a substitute for detailed, location-specific scientific assessments conducted by climate experts and official meteorological agencies. Always consult with qualified professionals for critical decision-making and local planning.</p>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}

interface ReportSectionProps {
  title: string;
  children: React.ReactNode;
  icon: React.ElementType;
}
const ReportSection = ({title, children, icon: Icon}: ReportSectionProps) => (
  <section className="py-5 group"> 
    <h3 className="text-xl lg:text-2xl font-semibold mb-4 pb-3 border-b border-border/80 text-secondary flex items-center gap-3.5 transition-colors hover:text-secondary/90">
      <Icon className="w-7 h-7 lg:w-8 lg:h-8 transition-transform duration-300 group-hover:scale-110"/>
      {title}
    </h3>
    <div className="space-y-2.5 text-sm md:text-base text-foreground/90 pl-2 md:pl-4">
      {children}
    </div>
  </section>
);
