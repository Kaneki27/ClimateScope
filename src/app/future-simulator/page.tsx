
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Thermometer, CloudRain, ShieldAlert, Zap, Waves, TrendingUp, Sun, Wind, Mountain, Building, Leaf, Loader2 } from "lucide-react"; 
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface BasePrediction {
  baseAvgTemp: [number, number]; 
  rainfallPatterns: string[];
  floodRisk: string[];
  wildfireDroughtLikelihood: string[];
  seaLevelRise?: [number, number]; 
  extremeEvents?: string[]; 
  ecoImpacts?: string[];
}

const baseScenarioData: Record<string, BasePrediction> = {
  "SSP1-2.6": { 
    baseAvgTemp: [1.3, 2.0],
    rainfallPatterns: ["Slight increase in total, more intense localized events, improved predictability", "Generally stable with regional variations, some areas may see more consistent rainfall", "More predictable patterns, though extreme short bursts can still occur, leading to localized runoff issues"],
    floodRisk: ["Moderate increase in known vulnerable areas, largely mitigated by proactive green infrastructure and planning", "Localized increases possible, overall manageable with strong adaptation and community efforts", "Slight increase primarily affecting unprepared coastal and riverside areas, less urban spread due to better zoning"],
    wildfireDroughtLikelihood: ["Slightly increased risk of regional droughts, wildfires effectively managed with advanced monitoring and land practices", "Occasional moderate droughts in historically susceptible regions, wildfire spread limited by fuel management", "Wildfire risk increase minimal with global proactive land management, fire suppression, and community awareness"],
    seaLevelRise: [30, 60], 
    extremeEvents: ["Fewer extreme heatwaves compared to higher scenarios, but still more than historical averages; some increase in localized storm intensity", "Increase in heavy precipitation events in specific regions, drought periods less severe but potentially more frequent in others", "Overall reduction in the growth rate of extreme event frequency due to mitigation efforts"],
    ecoImpacts: ["Coral reef bleaching significantly reduced but recovery is slow; moderate shifts in species distribution with some successful conservation", "Improved biodiversity conservation efforts show positive results in many ecosystems; agricultural adaptation largely successful", "Forests show resilience in many areas, though some vulnerable ecosystems remain stressed"],
  },
  "SSP2-4.5": { 
    baseAvgTemp: [2.2, 3.6], 
    rainfallPatterns: ["More erratic, significant regional variations in amount and timing, leading to water management challenges", "Increased frequency of heavy downpours and flash floods in some areas, while others face extended dry spells", "Longer, more intense dry spells in semi-arid and arid regions, impacting agriculture and water supplies"],
    floodRisk: ["Significant increase in flood frequency and extent, impacting more urban and rural areas, requiring substantial defense investment", "Riverine and coastal flooding becomes a major concern, with existing defenses often overwhelmed", "Flash flood risk elevated across multiple topographies, especially in rapidly urbanizing areas"],
    wildfireDroughtLikelihood: ["Moderate to significant increase in both wildfire acreage burned and drought duration/intensity globally", "Increased probability of 'mega-droughts' in continental interiors and Mediterranean-like climates, lasting multiple seasons", "Wildfire season extends significantly, posing year-round threats in some regions with greater intensity"],
    seaLevelRise: [45, 80], 
    extremeEvents: ["Noticeable increase in heatwave frequency, intensity, and duration, impacting health and infrastructure", "More powerful hurricanes/cyclones with higher peak wind speeds and greater rainfall, leading to more damage", "Compound events (e.g., drought followed by intense rain and flood) become more likely and complex to manage"],
    ecoImpacts: ["Widespread coral reef mortality and significant biodiversity loss; major ecosystem disruptions and shifts in biomes", "Agricultural yields impacted negatively in many key regions, threatening food security for vulnerable populations", "Increased stress on freshwater ecosystems and fisheries due to temperature and flow changes"],
  },
  "SSP5-8.5": { 
    baseAvgTemp: [3.9, 5.8], 
    rainfallPatterns: ["Extreme variability, with severe droughts and catastrophic floods becoming common, leading to systemic water crises", "Atmospheric rivers become more common and intense, leading to widespread inundation in affected coastal and mountainous regions", "Rainfall distribution highly unpredictable; monsoonal systems become erratic and less reliable"],
    floodRisk: ["Very high, widespread and frequent flooding, critical infrastructure (energy, transport, water) at severe risk or failing regularly", "Permanent inundation of some coastal cities and large land areas, leading to mass displacement", "Pluvial (surface water) flooding overwhelms urban drainage systems routinely, even in areas not traditionally flood-prone"],
    wildfireDroughtLikelihood: ["High and persistent risk of prolonged, severe droughts and uncontrollable megafires across multiple continents", "Ecosystems transition to fire-adapted or desertified states in many regions; widespread loss of forests", "Water scarcity becomes a critical global issue, leading to significant conflict, displacement, and humanitarian crises"],
    seaLevelRise: [65, 110], 
    extremeEvents: ["Frequent, prolonged, and dangerous heatwaves, potentially lethal for vulnerable populations without significant adaptation", "Category 5+ storms become more common, with unprecedented destructive potential and wider impact zones", "Cascading climate failures impacting multiple sectors (food, water, energy, health) simultaneously and globally"],
    ecoImpacts: ["Irreversible loss of most coral reefs and many coastal ecosystems like mangroves and salt marshes; mass extinction events", "Collapse of major biomes (e.g., Amazon rainforest, boreal forests) with global repercussions for climate regulation and biodiversity", "Global food production severely threatened, with widespread famine and malnutrition in many parts of the world"],
  },
};

type ScenarioKey = keyof typeof baseScenarioData;

interface GeneratedPredictionData {
  avgTemp: string;
  rainfallPatterns: string;
  floodRisk: string;
  wildfireDroughtLikelihood: string;
  seaLevelRiseInfo?: string;
  extremeEventsInfo?: string;
  adaptationFocus?: string;
  ecoImpactsInfo?: string;
  regionalNuances?: string;
  imageSeed: string;
  imageHint: string;
}

const lifestyleModifiers = {
  sustainable: { tempMultiplier: 0.85, riskReduction: 0.3, adaptation: "Focus on proactive, nature-based solutions, strong community resilience, circular economy principles, and significant investment in green technologies.", ecoBonus: 0.2 },
  current: { tempMultiplier: 1.0, riskReduction: 0, adaptation: "Mix of reactive adaptation, some grey and green infrastructure projects, moderate policy implementation, and reliance on existing technologies.", ecoBonus: 0 },
  "carbon-heavy": { tempMultiplier: 1.15, riskReduction: -0.25, adaptation: "Heavy reliance on engineered solutions, often delayed action, primary focus on disaster response over prevention, limited investment in systemic change.", ecoBonus: -0.15 },
};

const cityArchetypes = {
    coastal: { nuances: "Enhanced focus on sea-level rise, storm surges, saltwater intrusion, and coastal erosion. Potential for blue carbon initiatives and managed retreat strategies.", icon: Waves },
    mountain: { nuances: "Concerns for glacier melt, changes in snowpack affecting water supply, increased landslide and rockfall risks, and shifts in alpine ecosystems and tourism.", icon: Mountain },
    urban: { nuances: "Heat island effect amplification, strain on urban drainage and critical infrastructure (transport, energy, water), air quality concerns, and addressing social vulnerability hotspots.", icon: Building },
    rural: { nuances: "Impacts on agriculture (crop suitability, yields, pests) and forestry, water resource management for irrigation, biodiversity in surrounding natural areas, and rural livelihood diversification.", icon: Leaf },
    generic: { nuances: "General climate impacts applicable across diverse settings; adapt focus based on specific inputs regarding local geography and economy.", icon: Sun }
};
type CityArchetypeKey = keyof typeof cityArchetypes;


const getRandomElement = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const generateFutureImageHint = (
  scenarioKey: ScenarioKey,
  cityArchetypeKey: CityArchetypeKey,
  lifestyleKey: keyof typeof lifestyleModifiers
): string => {
  let part1 = cityArchetypeKey === 'generic' ? 'cityscape' : cityArchetypeKey;
  let part2 = "";

  if (scenarioKey === "SSP5-8.5" || lifestyleKey === "carbon-heavy") {
    part2 = "pollution";
  } else if (scenarioKey === "SSP1-2.6" || lifestyleKey === "sustainable") {
    part2 = "green";
     if (part1 === 'mountain') part1 = 'alpine'; 
     else if (part1 === 'coastal') part2 = 'future'; 
  } else { 
    part2 = "future";
  }
  
  let hint = `${part1} ${part2}`.trim();
  const words = hint.split(" ");
  return words.slice(0, 2).join(" "); 
};

const generateSimulatedPredictions = (
  scenarioKey: ScenarioKey,
  city: string, 
  lifestyle: keyof typeof lifestyleModifiers,
  cityArchetypeKey: CityArchetypeKey
): GeneratedPredictionData => {
  const base = baseScenarioData[scenarioKey];
  const modifier = lifestyleModifiers[lifestyle];
  const archetype = cityArchetypes[cityArchetypeKey];

  const tempMin = base.baseAvgTemp[0] * modifier.tempMultiplier + (Math.random() * 0.6 - 0.3); 
  const tempMax = base.baseAvgTemp[1] * modifier.tempMultiplier + (Math.random() * 0.7 - 0.35); 

  let seaLevelRiseInfo: string | undefined = undefined;
  if (base.seaLevelRise && (cityArchetypeKey === 'coastal' || (cityArchetypeKey !== 'mountain' && Math.random() < 0.25))) { 
    const slrMin = base.seaLevelRise[0] * modifier.tempMultiplier + (Math.random() * 20 - 10); 
    const slrMax = base.seaLevelRise[1] * modifier.tempMultiplier + (Math.random() * 25 - 12); 
    seaLevelRiseInfo = `Approx. +${Math.max(0, slrMin).toFixed(0)}-${Math.max(slrMin + 5, slrMax).toFixed(0)} cm (highly variable, influenced by local topography, ocean currents, and land subsidence). Coastal adaptation critical.`;
  }
  
  const riskLevelWords = ["Very Low", "Low", "Moderate", "Elevated", "High", "Very High", "Critical", "Catastrophic"];
  const applyRiskModification = (baseRiskString: string): string => {
    let baseIndex = Math.floor(Math.random() * 2) + 3; 
    if (baseRiskString.toLowerCase().includes("low") || baseRiskString.toLowerCase().includes("minimal")) baseIndex = 1;
    if (baseRiskString.toLowerCase().includes("high") || baseRiskString.toLowerCase().includes("significant") || baseRiskString.toLowerCase().includes("major")) baseIndex = 4;
    if (baseRiskString.toLowerCase().includes("very high") || baseRiskString.toLowerCase().includes("critical") || baseRiskString.toLowerCase().includes("severe")) baseIndex = 5;
    
    let modifiedIndex = Math.round(baseIndex - (riskLevelWords.length-1) * modifier.riskReduction + (Math.random()*0.6-0.3)); 
    modifiedIndex = Math.max(0, Math.min(riskLevelWords.length - 1, modifiedIndex));
    return riskLevelWords[modifiedIndex];
  };

  const imageHint = generateFutureImageHint(scenarioKey, cityArchetypeKey, lifestyle);

  return {
    avgTemp: `Projected +${tempMin.toFixed(1)}°C to +${tempMax.toFixed(1)}°C (vs. pre-industrial). ${city}-specific microclimates may cause local variations. More frequent and intense heatwaves highly probable.`,
    rainfallPatterns: getRandomElement(base.rainfallPatterns) + ` Water availability and management in ${city} will be a key challenge, requiring robust strategies.`,
    floodRisk: `${getRandomElement(base.floodRisk)} (Overall Risk for ${city} area: ${applyRiskModification(getRandomElement(base.floodRisk))})`,
    wildfireDroughtLikelihood: `${getRandomElement(base.wildfireDroughtLikelihood)} (Regional Threat Level for ${city}: ${applyRiskModification(getRandomElement(base.wildfireDroughtLikelihood))})`,
    seaLevelRiseInfo,
    extremeEventsInfo: base.extremeEvents ? getRandomElement(base.extremeEvents) + ` Frequency and intensity influenced by global emissions pathway and local preparedness in ${city}. Expect increased insurance costs and infrastructure strain.` : `General increase in climate-related extremes for ${city}, impacting daily life and economic activity.`,
    adaptationFocus: modifier.adaptation + ` Specific strategies for ${city} should urgently include: ${archetype.nuances}`,
    ecoImpactsInfo: base.ecoImpacts ? getRandomElement(base.ecoImpacts) + (modifier.ecoBonus > 0 ? " Concerted efforts towards sustainability may mitigate some local impacts and foster green job creation." : (modifier.ecoBonus < 0 ? " High carbon pathway significantly exacerbates ecological damage and biodiversity loss." : " Standard conservation efforts may prove insufficient.")) : `Significant ecological shifts and biodiversity loss expected around ${city}.`,
    regionalNuances: `For ${city} (${cityArchetypeKey}): ${archetype.nuances}`,
    imageSeed: `${city.replace(/\s+/g, '')}-${scenarioKey}-${lifestyle}-${cityArchetypeKey}-${Date.now()}`,
    imageHint,
  };
};


export default function FutureSimulatorPage() {
  const [city, setCity] = useState("");
  const [scenario, setScenario] = useState<ScenarioKey>("SSP2-4.5");
  const [lifestyle, setLifestyle] = useState<keyof typeof lifestyleModifiers>("current");
  const [cityArchetype, setCityArchetype] = useState<CityArchetypeKey>("generic");
  const [predictions, setPredictions] = useState<GeneratedPredictionData | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const handleSimulate = () => {
    if (!city) {
      toast({ title: "City Required", description: "Please enter a city name to start simulation.", variant: "destructive"});
      return;
    }
    setLoading(true);
    setPredictions(null); 
    
    setTimeout(() => {
      const generatedPreds = generateSimulatedPredictions(scenario, city, lifestyle, cityArchetype);
      setPredictions(generatedPreds);
      setLoading(false);
      toast({
        title: "Simulation Complete!",
        description: `Future projection for ${city} under ${scenario} (${lifestyle} path, ${cityArchetype} type) is ready.`,
      });
    }, 1500 + Math.random() * 1000); 
  };

  const ArchetypeIcon = cityArchetypes[cityArchetype].icon;

  return (
    <div className="space-y-8">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in-up">
         <div>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-primary">Your City in 2050 Simulator</h1>
            <p className="text-muted-foreground mt-1">Explore potential climate futures based on IPCC scenarios, societal paths, and city types.</p>
        </div>
      </div>

      <Card className="shadow-xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl"><TrendingUp className="text-primary h-7 w-7"/>Simulation Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label htmlFor="cityInput" className="block text-sm font-medium text-foreground mb-1.5">Your City</label>
              <Input
                id="cityInput"
                type="text"
                placeholder="Enter city name (e.g., London)"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                
              />
            </div>
            <div>
              <label htmlFor="cityArchetypeSelect" className="block text-sm font-medium text-foreground mb-1.5">City Archetype</label>
              <Select value={cityArchetype} onValueChange={(value) => setCityArchetype(value as CityArchetypeKey)}>
                <SelectTrigger id="cityArchetypeSelect" className="shadow-sm">
                  <SelectValue placeholder="Select City Type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(cityArchetypes).map(([key, val]) => (
                    <SelectItem key={key} value={key}>
                       <div className="flex items-center gap-2.5">
                        <val.icon className="h-5 w-5 text-muted-foreground" />
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                       </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="scenarioSelect" className="block text-sm font-medium text-foreground mb-1.5">IPCC Scenario (by 2050)</label>
              <Select value={scenario} onValueChange={(value) => setScenario(value as ScenarioKey)}>
                <SelectTrigger id="scenarioSelect" className="shadow-sm">
                  <SelectValue placeholder="Select IPCC Scenario" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SSP1-2.6">SSP1-2.6 (Sustainability Focus)</SelectItem>
                  <SelectItem value="SSP2-4.5">SSP2-4.5 (Middle of the Road)</SelectItem>
                  <SelectItem value="SSP5-8.5">SSP5-8.5 (Fossil-fueled Development)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="lifestyleSelect" className="block text-sm font-medium text-foreground mb-1.5">Societal Path</label>
              <Select value={lifestyle} onValueChange={(value) => setLifestyle(value as keyof typeof lifestyleModifiers)}>
                <SelectTrigger id="lifestyleSelect" className="shadow-sm">
                  <SelectValue placeholder="Select Societal Path" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sustainable">Sustainable & Resilient Path</SelectItem>
                  <SelectItem value="current">Current Trajectory & Policies</SelectItem>
                  <SelectItem value="carbon-heavy">Carbon-Heavy & Delayed Action</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
           <p className="text-xs text-muted-foreground mt-2">Note: Societal path & city type significantly modify simulation outcomes based on generalized assumptions.</p>
          <Button onClick={handleSimulate} disabled={loading || !city} size="lg" className="w-full md:w-auto shadow-md hover:shadow-lg transition-shadow">
            {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin"/> Simulating...</> : "Simulate Future Climate"}
          </Button>
        </CardContent>
      </Card>

      {predictions && !loading && (
        <Card className="shadow-2xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl lg:text-3xl">
                <ArchetypeIcon className="h-8 w-8 text-primary" /> 
                2050 Climate Predictions for {city} 
            </CardTitle>
            <CardDescription className="text-base">Scenario: {scenario} | Societal Path: {lifestyle.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')} | Archetype: {cityArchetype.charAt(0).toUpperCase() + cityArchetype.slice(1)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-5 md:grid-cols-2">
              <PredictionItem icon={Thermometer} title="Expected Avg. Temperature" value={predictions.avgTemp} />
              <PredictionItem icon={CloudRain} title="Rainfall Patterns & Water Availability" value={predictions.rainfallPatterns} />
              <PredictionItem icon={ShieldAlert} title="Flood Risk Assessment" value={predictions.floodRisk} />
              <PredictionItem icon={Zap} title="Wildfire & Drought Likelihood" value={predictions.wildfireDroughtLikelihood} />
              {predictions.seaLevelRiseInfo && <PredictionItem icon={Waves} title="Sea Level Rise Impact" value={predictions.seaLevelRiseInfo} />}
              {predictions.extremeEventsInfo && <PredictionItem icon={Wind} title="Extreme Weather Events Outlook" value={predictions.extremeEventsInfo} /> }
              {predictions.ecoImpactsInfo && <PredictionItem icon={Leaf} title="Ecological & Biodiversity Impacts" value={predictions.ecoImpactsInfo} />}
            </div>
             {predictions.regionalNuances && (
                <div className="mt-6 p-5 bg-muted/70 rounded-lg shadow">
                    <h4 className="font-semibold text-lg text-foreground/90 mb-2 flex items-center gap-2.5"><ArchetypeIcon className="h-6 w-6 text-primary"/>Key Regional Considerations for {city} ({cityArchetype.charAt(0).toUpperCase() + cityArchetype.slice(1)}):</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{predictions.regionalNuances.split(cityArchetype + "): ")[1]}</p>
                </div>
            )}
            {predictions.adaptationFocus && (
                <div className="mt-6 p-5 bg-secondary/15 rounded-lg shadow">
                    <h4 className="font-semibold text-lg text-secondary mb-2">Primary Adaptation Focus:</h4>
                    <p className="text-sm text-secondary-foreground/95 leading-relaxed">{predictions.adaptationFocus.split("Specific strategies")[0]}</p>
                </div>
            )}
             <div className="mt-8 p-4 bg-muted/80 rounded-xl text-center shadow-inner">
                <p className="text-xl font-semibold mb-3">Visualizing {city} in 2050 ({scenario}, {lifestyle.replace('-', ' ')} path)</p>
                <div className="mt-3 aspect-video bg-gray-300/70 rounded-lg flex items-center justify-center overflow-hidden">
                    {predictions.imageSeed && ( 
                        <Image 
                            src={`https://placehold.co/800x450.png?text=Future+${encodeURIComponent(city)}&seed=${predictions.imageSeed}`}
                            alt={`Simulated view of ${city} in 2050 under ${scenario} scenario with ${lifestyle} lifestyle and ${cityArchetype} type.`}
                            width={800}
                            height={450}
                            className="rounded-md object-cover transition-transform duration-500 hover:scale-105"
                            key={predictions.imageSeed} 
                            data-ai-hint={predictions.imageHint}
                            priority
                        />
                    )}
                </div>
                <p className="text-sm text-muted-foreground mt-3">Conceptual visualization based on selected scenario and societal path. Actual outcomes will vary.</p>
            </div>
             <p className="text-xs text-muted-foreground text-center mt-6">Disclaimer: This simulation provides generalized projections based on established IPCC frameworks and archetypal data. For specific, actionable insights, consult detailed local climate impact assessments.</p>
          </CardContent>
        </Card>
      )}
       {loading && (
        <Card className="shadow-xl text-center py-12 animate-fade-in-up">
          <CardHeader>
            <CardTitle className="text-2xl">Simulating future for {city}...</CardTitle>
          </CardHeader>
          <CardContent>
            <Loader2 className="h-16 w-16 text-primary mx-auto mb-6 animate-spin" />
            <p className="text-muted-foreground text-lg">Gathering climate model data and crunching numbers for {city} ({scenario}, {lifestyle.replace('-', ' ')}, {cityArchetype})...</p>
            <p className="text-sm text-muted-foreground mt-2">(This is a simulated process for demonstration)</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface PredictionItemProps {
  icon: React.ElementType;
  title: string;
  value: string;
}

const PredictionItem = ({ icon: Icon, title, value }: PredictionItemProps) => (
  <Card className="shadow-lg hover:shadow-xl hover:scale-[1.02] transform transition-all duration-300 ease-out bg-background/80 rounded-xl">
    <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-3 pt-5 px-5">
      <div className="p-2 bg-primary/10 rounded-full">
        <Icon className="h-7 w-7 text-primary" />
      </div>
      <CardTitle className="text-lg font-semibold leading-tight pt-1">{title}</CardTitle>
    </CardHeader>
    <CardContent className="px-5 pb-5">
      <p className="text-foreground/90 text-sm leading-relaxed">{value}</p>
    </CardContent>
  </Card>
);
