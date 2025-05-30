
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Thermometer, Droplets, Waves, Sun, TrendingUp, MapPin, CloudSnow, Wind, Cloud, Umbrella, Sunrise, Sunset, Eye, Gauge, Loader2, Leaf, AlertTriangle, ShieldCheck, BarChart3, AirVent, CalendarClock, Landmark } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";


interface OpenWeatherData {
  city: string;
  country: string;
  temperature: number;
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  pressure: number;
  humidity: number;
  visibility: number;
  windSpeed: number;
  windDeg: number;
  cloudiness: number;
  weatherMain: string;
  weatherDescription: string;
  weatherIcon: string | null;
  sunrise: number; // Unix timestamp
  sunset: number;  // Unix timestamp
  timezone: number;
  coordinates: {
    lat: number;
    lon: number;
  };
  rainVolumeLastHour?: number;
  snowVolumeLastHour?: number;
  timestamp: number;
}

interface ExtremeEvent {
  id: string;
  year: number;
  type: string;
  description: string;
}

interface CityClimateData {
  currentTemperature?: string;
  feelsLike?: string;
  weatherDescription?: string;
  weatherIconUrl?: string | null;
  humidity?: string;
  windSpeed?: string;
  windDirection?: string;
  pressure?: string;
  visibility?: string;
  cloudiness?: string;
  sunriseTime?: string;
  sunsetTime?: string;
  rainLastHour?: string;
  snowLastHour?: string;
  dataTimestamp?: string;

  avgTempChangeSimulated: string;
  rainfallAnomaliesSimulated: string;
  seaLevelRiseSimulated: string;
  co2FootprintTrendSimulated: string;
  extremeWeatherOutlookSimulated: string;

  // New Enhancements
  aqiSimulated?: { value: number; category: string; healthImplications: string; colorClass: string; };
  greenCoverImageSeed2000?: string;
  greenCoverImageSeed2020?: string;
  extremeEventsSimulated?: ExtremeEvent[];
  climateRanksSimulated?: {
    overallRisk: string;
    tempRise: string;
    seaLevelVulnerability: string;
  };
  weatherAlertsSimulated?: string[];


  coords: { lat: number; lon: number };
  isCoastal: boolean;
  mapImageSeed: string;
  cityNameForDisplay: string;
}


const initialCityNamesForPlaceholder = [
  "Chennai", "London", "Paris", "Tokyo", "New York", "Cairo", "Sydney", "Rio de Janeiro", "Moscow", "Mumbai", "Berlin", "Amsterdam", "Dubai", "Singapore"
];

const getRandomElement = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const getAQISimulated = (): CityClimateData["aqiSimulated"] => {
  const aqiValue = Math.floor(Math.random() * 300) + 10; // 10 to 310
  let category = "Good";
  let healthImplications = "Air quality is considered satisfactory, and air pollution poses little or no risk.";
  let colorClass = "text-green-500";

  if (aqiValue > 50 && aqiValue <= 100) {
    category = "Moderate";
    healthImplications = "Air quality is acceptable; however, for some pollutants there may be a moderate health concern for a very small number of people who are unusually sensitive to air pollution.";
    colorClass = "text-yellow-500";
  } else if (aqiValue > 100 && aqiValue <= 150) {
    category = "Unhealthy for Sensitive Groups";
    healthImplications = "Members of sensitive groups may experience health effects. The general public is not likely to be affected.";
    colorClass = "text-orange-500";
  } else if (aqiValue > 150 && aqiValue <= 200) {
    category = "Unhealthy";
    healthImplications = "Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.";
    colorClass = "text-red-500";
  } else if (aqiValue > 200 && aqiValue <= 300) {
    category = "Very Unhealthy";
    healthImplications = "Health alert: everyone may experience more serious health effects.";
    colorClass = "text-purple-500";
  } else if (aqiValue > 300) {
    category = "Hazardous";
    healthImplications = "Health warnings of emergency conditions. The entire population is more likely to be affected.";
    colorClass = "text-rose-700";
  }
  return { value: aqiValue, category, healthImplications, colorClass };
};

const getExtremeEventsSimulated = (cityName: string): ExtremeEvent[] => {
  const eventTypes = ["Heatwave", "Flash Flood", "Severe Storm", "Drought Period", "Coastal Surge"];
  const descriptions = [
    `caused significant disruption to services in ${cityName}.`,
    `led to localized evacuations and infrastructure damage.`,
    `impacted agricultural output in the surrounding region of ${cityName}.`,
    `resulted in record high temperatures for several days.`,
    `tested the city's emergency response capabilities.`
  ];
  const count = Math.floor(Math.random() * 3) + 1; // 1 to 3 events
  const events: ExtremeEvent[] = [];
  const currentYear = new Date().getFullYear();
  for (let i = 0; i < count; i++) {
    events.push({
      id: `event-${cityName.replace(/\s+/g, '')}-${i}-${Date.now()}`,
      year: currentYear - (Math.floor(Math.random() * 15) + 1), // 1 to 15 years ago
      type: getRandomElement(eventTypes),
      description: `${getRandomElement(eventTypes)} ${getRandomElement(descriptions)}`
    });
  }
  return events.sort((a, b) => b.year - a.year);
};


const generateSimulatedTrendData = (cityName: string): Partial<CityClimateData> => {
  const isCoastalCity = ["New York", "Tokyo", "Sydney", "Rio de Janeiro", "Mumbai", "Chennai", "Amsterdam", "Dubai", "Singapore"].includes(cityName) || Math.random() > 0.35;
  const trends = ["Sharply Increasing", "Gradually Increasing", "Stable with Minor Fluctuations", "Slowly Decreasing", "Notably Decreasing"];
  const extremeWeatherTypes = ["more frequent and intense heatwaves", "heavier and more erratic rainfall events", "longer and more severe droughts", "stronger coastal storms and surges", "unseasonal temperature swings and frost days", "increased wildfire risk periods"];

  const tempChangeMagnitude = (Math.random() * 2.5 + 0.5).toFixed(1); // +0.5 to +3.0
  const rainfallChangeMagnitude = (Math.random() * 25 + 5).toFixed(1); // 5% to 30%
  const seaLevelChangeMagnitude = isCoastalCity ? (Math.random() * 20 + 5).toFixed(1) : "0"; // 5cm to 25cm if coastal

  const citySuffix = cityName.replace(/\s+/g, '') + Date.now();

  const ranks = ["Top 10%", "Top 25%", "Average", "Below Average", "Bottom 25%"];

  const simulatedAlerts = Math.random() > 0.7 ? [`${getRandomElement(["High Wind Warning", "Flood Watch", "Air Quality Alert"])} in effect for ${cityName} until ${new Date(Date.now() + Math.random() * 86400000).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}`] : [];


  return {
    avgTempChangeSimulated: `${Math.random() > 0.2 ? '+' : '-'}${tempChangeMagnitude}°C since ${1960 + Math.floor(Math.random()*20)} (simulated trend)`,
    rainfallAnomaliesSimulated: `${(Math.random() > 0.5 ? '+' : '-')}${rainfallChangeMagnitude}% annual deviation (simulated trend)`,
    seaLevelRiseSimulated: isCoastalCity ? `+${seaLevelChangeMagnitude} cm (simulated, if coastal)` : "N/A (not coastal or limited data)",
    co2FootprintTrendSimulated: `${getRandomElement(trends)} (estimated local trend)`,
    extremeWeatherOutlookSimulated: `Expect ${getRandomElement(extremeWeatherTypes)} (simulated projection for region)`,
    isCoastal: isCoastalCity,
    mapImageSeed: `${citySuffix}Map${Math.random().toString(36).substring(7)}`,
    // New enhancements
    aqiSimulated: getAQISimulated(),
    greenCoverImageSeed2000: `greenCover${citySuffix}2000`,
    greenCoverImageSeed2020: `greenCover${citySuffix}2020`,
    extremeEventsSimulated: getExtremeEventsSimulated(cityName),
    climateRanksSimulated: {
      overallRisk: getRandomElement(ranks),
      tempRise: getRandomElement(ranks),
      seaLevelVulnerability: isCoastalCity ? getRandomElement(ranks) : "N/A",
    },
    weatherAlertsSimulated: simulatedAlerts,
  };
};

const formatUnixTimestamp = (timestamp: number, timezoneOffset: number): string => {
  const date = new Date((timestamp + timezoneOffset) * 1000);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
};

const getWindDirection = (degrees: number): string => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    return directions[Math.round(degrees / 22.5) % 16];
};


export default function CityTrackerPage() {
  const [cityInput, setCityInput] = useState("");
  const [searchedCityName, setSearchedCityName] = useState<string | null>(null);
  const [cityClimateData, setCityClimateData] = useState<CityClimateData | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [placeholderCity, setPlaceholderCity] = useState<string>("London");

  useEffect(() => {
    const randomCity = initialCityNamesForPlaceholder[Math.floor(Math.random() * initialCityNamesForPlaceholder.length)];
    setPlaceholderCity(randomCity);
  }, []);

  const handleSearch = async (searchQuery?: string) => {
    const currentCityToSearch = searchQuery || cityInput;
    if (!currentCityToSearch) {
      toast({
        title: "Input Required",
        description: "Please enter a city name.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    setSearchedCityName(currentCityToSearch);
    setCityClimateData(null);

    try {
      const response = await fetch(`/api/weather?city=${encodeURIComponent(currentCityToSearch)}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Weather data not found for ${currentCityToSearch}. Please check the city name or try another location.`);
      }
      const weatherData: OpenWeatherData = await response.json();

      const simulatedTrends = generateSimulatedTrendData(weatherData.city) as Partial<CityClimateData>;

      const combinedData: CityClimateData = {
        ...simulatedTrends,
        cityNameForDisplay: `${weatherData.city}, ${weatherData.country}`,
        currentTemperature: `${weatherData.temperature.toFixed(1)}°C`,
        feelsLike: `${weatherData.feelsLike.toFixed(1)}°C`,
        weatherDescription: weatherData.weatherDescription.charAt(0).toUpperCase() + weatherData.weatherDescription.slice(1),
        weatherIconUrl: weatherData.weatherIcon,
        humidity: `${weatherData.humidity}%`,
        windSpeed: `${weatherData.windSpeed.toFixed(1)} m/s`,
        windDirection: weatherData.windDeg !== undefined ? getWindDirection(weatherData.windDeg) : "N/A",
        pressure: `${weatherData.pressure} hPa`,
        visibility: weatherData.visibility ? `${(weatherData.visibility / 1000).toFixed(1)} km` : "N/A",
        cloudiness: `${weatherData.cloudiness}%`,
        sunriseTime: weatherData.sunrise ? formatUnixTimestamp(weatherData.sunrise, weatherData.timezone) : "N/A",
        sunsetTime: weatherData.sunset ? formatUnixTimestamp(weatherData.sunset, weatherData.timezone) : "N/A",
        rainLastHour: weatherData.rainVolumeLastHour ? `${weatherData.rainVolumeLastHour.toFixed(1)} mm` : undefined,
        snowLastHour: weatherData.snowVolumeLastHour ? `${weatherData.snowVolumeLastHour.toFixed(1)} mm` : undefined,
        dataTimestamp: weatherData.timestamp ? `As of ${new Date(weatherData.timestamp * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', timeZoneName: 'short'})}`: "Timestamp N/A",
        coords: weatherData.coordinates,
        isCoastal: simulatedTrends.isCoastal !== undefined ? simulatedTrends.isCoastal : Math.random() > 0.5,
        mapImageSeed: simulatedTrends.mapImageSeed || `${weatherData.city.replace(/\s+/g, '')}MapFallback${Date.now()}`,
        avgTempChangeSimulated: simulatedTrends.avgTempChangeSimulated || "N/A",
        rainfallAnomaliesSimulated: simulatedTrends.rainfallAnomaliesSimulated || "N/A",
        seaLevelRiseSimulated: simulatedTrends.seaLevelRiseSimulated || "N/A",
        co2FootprintTrendSimulated: simulatedTrends.co2FootprintTrendSimulated || "N/A",
        extremeWeatherOutlookSimulated: simulatedTrends.extremeWeatherOutlookSimulated || "N/A",
      };

      setCityClimateData(combinedData);
      toast({
        title: "Data Loaded",
        description: `Current weather and simulated climate insights for ${weatherData.city} are now displayed.`,
      });

    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        title: "Error Fetching Data",
        description: errMsg,
        variant: "destructive",
      });
      const simulatedForError = generateSimulatedTrendData(currentCityToSearch);
      setCityClimateData({
        cityNameForDisplay: currentCityToSearch,
        coords: { lat: 0, lon: 0 },
        ...simulatedForError,
        avgTempChangeSimulated: simulatedForError.avgTempChangeSimulated || "N/A (simulation error)",
        rainfallAnomaliesSimulated: simulatedForError.rainfallAnomaliesSimulated || "N/A (simulation error)",
        seaLevelRiseSimulated: simulatedForError.seaLevelRiseSimulated || "N/A (simulation error)",
        co2FootprintTrendSimulated: simulatedForError.co2FootprintTrendSimulated || "N/A (simulation error)",
        extremeWeatherOutlookSimulated: simulatedForError.extremeWeatherOutlookSimulated || "N/A (simulation error)",
        isCoastal: simulatedForError.isCoastal !== undefined ? simulatedForError.isCoastal : false,
        mapImageSeed: simulatedForError.mapImageSeed || `${currentCityToSearch.replace(/\s+/g, '')}ErrorMap${Date.now()}`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in-up">
         <div>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-primary">My City Climate Tracker</h1>
            <p className="text-muted-foreground mt-1">Get current weather and simulated long-term climate trends for your city.</p>
        </div>
      </div>

      <Card className="shadow-xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl"><MapPin className="text-primary h-7 w-7"/>City Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex w-full max-w-lg items-center space-x-3">
            <Input
              type="text"
              placeholder={`Enter city (e.g., ${placeholderCity})`}
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-grow text-base md:text-sm"
            />
            <Button onClick={() => handleSearch()} disabled={loading} size="lg" className="shadow-md hover:shadow-lg transition-shadow">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Searching...</> : "Search"}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-3">Enter a city name to see its current weather and simulated climate data trends, plus a placeholder map.</p>
          <div
            className="mt-6 aspect-[16/9] bg-muted/70 rounded-xl flex items-center justify-center overflow-hidden shadow-inner"
          >
            {searchedCityName && cityClimateData ? (
               <Image
                src={`https://placehold.co/800x450.png?text=${encodeURIComponent(cityClimateData.cityNameForDisplay)}&seed=${cityClimateData.mapImageSeed}`}
                alt={`Map of ${searchedCityName}`}
                width={800}
                height={450}
                className="rounded-lg object-cover transition-opacity duration-700 ease-in-out opacity-0 data-[loaded=true]:opacity-100"
                onLoad={(e) => e.currentTarget.setAttribute('data-loaded', 'true')}
                key={cityClimateData.mapImageSeed}
                data-ai-hint="city aerial"
                priority
                />
            ) : (
              <div className="text-muted-foreground p-6 text-center animate-subtle-pulse">
                <MapPin className="h-16 w-16 mx-auto mb-4 text-primary/50"/>
                Search for a city to display its map and data.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {cityClimateData?.weatherAlertsSimulated && cityClimateData.weatherAlertsSimulated.length > 0 && (
        <Card className="shadow-lg animate-fade-in-up bg-destructive/10 border-destructive" style={{ animationDelay: '0.15s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive text-xl">
              <AlertTriangle /> Weather Alerts for {cityClimateData.cityNameForDisplay}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cityClimateData.weatherAlertsSimulated.map((alert, index) => (
              <p key={index} className="text-destructive-foreground font-medium">{alert}</p>
            ))}
          </CardContent>
        </Card>
      )}


      {searchedCityName && (
        <Card className={cn(
          "shadow-xl transition-all duration-500 ease-out animate-fade-in-up",
          loading ? "opacity-60" : "opacity-100",
          !cityClimateData && "opacity-0" 
        )} style={{ animationDelay: '0.2s' }}>
          <CardHeader>
            <CardTitle className="text-2xl">Climate Insights for {cityClimateData?.cityNameForDisplay || searchedCityName}</CardTitle>
            {loading && <CardDescription className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin"/>Loading data...</CardDescription>}
            {!loading && !cityClimateData?.currentTemperature && <CardDescription className="text-destructive">Current weather data unavailable for {searchedCityName}. Showing simulated trends only.</CardDescription>}
            {cityClimateData?.dataTimestamp && <CardDescription className="text-xs text-muted-foreground">{cityClimateData.dataTimestamp}</CardDescription>}
          </CardHeader>
          {cityClimateData && !loading && (
            <CardContent className="space-y-8">
              {cityClimateData.currentTemperature ? (
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-secondary border-b pb-2">Current Weather Conditions</h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <InfoCard icon={Thermometer} title="Temperature" value={cityClimateData.currentTemperature || "N/A"} unit={cityClimateData.feelsLike ? `Feels like ${cityClimateData.feelsLike}` : undefined} />
                    <InfoCard icon={Umbrella} title="Weather" value={cityClimateData.weatherDescription || "N/A"} iconUrl={cityClimateData.weatherIconUrl}/>
                    <InfoCard icon={Droplets} title="Humidity" value={cityClimateData.humidity || "N/A"} />
                    <InfoCard icon={Wind} title="Wind" value={cityClimateData.windSpeed || "N/A"} unit={cityClimateData.windDirection} />
                    <InfoCard icon={Gauge} title="Pressure" value={cityClimateData.pressure || "N/A"} />
                    <InfoCard icon={Eye} title="Visibility" value={cityClimateData.visibility || "N/A"} />
                    <InfoCard icon={Cloud} title="Cloudiness" value={cityClimateData.cloudiness || "N/A"} />
                     {cityClimateData.aqiSimulated && (
                        <InfoCard
                          icon={AirVent}
                          title="AQI (Simulated)"
                          value={`${cityClimateData.aqiSimulated.value} - ${cityClimateData.aqiSimulated.category}`}
                          unit={cityClimateData.aqiSimulated.healthImplications}
                          valueClassName={cityClimateData.aqiSimulated.colorClass}
                        />
                      )}
                    {cityClimateData.rainLastHour && <InfoCard icon={Droplets} title="Rain (1h)" value={cityClimateData.rainLastHour} />}
                    {cityClimateData.snowLastHour && <InfoCard icon={CloudSnow} title="Snow (1h)" value={cityClimateData.snowLastHour} />}
                    <InfoCard icon={Sunrise} title="Sunrise" value={cityClimateData.sunriseTime || "N/A"} />
                    <InfoCard icon={Sunset} title="Sunset" value={cityClimateData.sunsetTime || "N/A"} />
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 bg-muted/50 rounded-lg">
                    <Thermometer className="h-12 w-12 text-muted-foreground mx-auto mb-3"/>
                    <p className="text-muted-foreground">Current weather data is currently unavailable for {searchedCityName}.</p>
                </div>
              )}

              <div>
                <h3 className="text-xl font-semibold my-4 pt-4 border-t text-secondary">Simulated Long-Term Climate Trends</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <InfoCard icon={TrendingUp} title="Avg. Temp Change (Simulated)" value={cityClimateData.avgTempChangeSimulated} unit="since reference year" />
                    <InfoCard icon={Droplets} title="Rainfall Anomalies (Simulated)" value={cityClimateData.rainfallAnomaliesSimulated} unit="annual deviation" />
                    <InfoCard icon={Waves} title="Sea Level Rise (Simulated)" value={cityClimateData.seaLevelRiseSimulated} unit={cityClimateData.isCoastal ? "if coastal" : "N/A"} />
                    <InfoCard icon={Sun} title="Extreme Weather (Simulated)" value={cityClimateData.extremeWeatherOutlookSimulated} unit="long-term projection" />
                    <InfoCard icon={TrendingUp} title="CO₂ Footprint Trend (Simulated)" value={cityClimateData.co2FootprintTrendSimulated} unit="estimated" />
                </div>
              </div>

              {cityClimateData.climateRanksSimulated && (
                <div>
                  <h3 className="text-xl font-semibold my-4 pt-4 border-t text-secondary">Simulated Climate Rankings for {cityClimateData.cityNameForDisplay}</h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <InfoCard icon={ShieldCheck} title="Overall Climate Risk" value={cityClimateData.climateRanksSimulated.overallRisk} unit="National Comparison (Simulated)" />
                    <InfoCard icon={Thermometer} title="Temperature Rise Impact" value={cityClimateData.climateRanksSimulated.tempRise} unit="National Comparison (Simulated)" />
                    <InfoCard icon={Waves} title="Sea Level Vulnerability" value={cityClimateData.climateRanksSimulated.seaLevelVulnerability} unit="National Comparison (Simulated)" />
                  </div>
                </div>
              )}


              {cityClimateData.extremeEventsSimulated && cityClimateData.extremeEventsSimulated.length > 0 && (
                 <div className="mt-6">
                    <h3 className="text-xl font-semibold my-4 pt-4 border-t text-secondary">Simulated Past Extreme Events</h3>
                    <div className="space-y-4">
                    {cityClimateData.extremeEventsSimulated.map((event) => (
                        <Card key={event.id} className="shadow-md hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <CalendarClock className="h-5 w-5 text-primary" />
                                    {event.year}: {event.type}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{event.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                    </div>
                </div>
              )}


              <div className="grid gap-6 md:grid-cols-2 mt-6">
                <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
                  <CardHeader><CardTitle>Temperature Trend (Conceptual)</CardTitle></CardHeader>
                  <CardContent className="h-64 bg-muted/60 rounded-lg flex items-center justify-center p-2 overflow-hidden">
                     <Image src={`https://placehold.co/400x240.png?text=Temp+Trend&seed=${cityClimateData.mapImageSeed}Temp`} alt={`Conceptual temperature trend for ${searchedCityName}`} width={400} height={240} className="rounded-md object-contain transition-transform duration-500 hover:scale-105" data-ai-hint="temperature chart graph" />
                  </CardContent>
                </Card>
                <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
                  <CardHeader><CardTitle>Precipitation Pattern (Conceptual)</CardTitle></CardHeader>
                   <CardContent className="h-64 bg-muted/60 rounded-lg flex items-center justify-center p-2 overflow-hidden">
                     <Image src={`https://placehold.co/400x240.png?text=Rain+Pattern&seed=${cityClimateData.mapImageSeed}Rain`} alt={`Conceptual rainfall pattern for ${searchedCityName}`} width={400} height={240} className="rounded-md object-contain transition-transform duration-500 hover:scale-105" data-ai-hint="rainfall chart graph" />
                  </CardContent>
                </Card>
              </div>

             {cityClimateData.greenCoverImageSeed2000 && cityClimateData.greenCoverImageSeed2020 && (
                <div className="mt-6">
                    <h3 className="text-xl font-semibold my-4 pt-4 border-t text-secondary">Simulated Green Cover Change (Conceptual)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="shadow-md hover:shadow-lg transition-shadow">
                            <CardHeader><CardTitle>Circa 2000</CardTitle></CardHeader>
                            <CardContent className="h-64 bg-muted/60 rounded-lg flex items-center justify-center p-2 overflow-hidden">
                                <Image
                                    src={`https://placehold.co/400x220.png?text=Green+Cover+2000&seed=${cityClimateData.greenCoverImageSeed2000}`}
                                    alt={`Simulated green cover for ${cityClimateData.cityNameForDisplay} around 2000`}
                                    width={400} height={220}
                                    className="rounded-md object-contain"
                                    data-ai-hint="forest aerial" />
                            </CardContent>
                        </Card>
                        <Card className="shadow-md hover:shadow-lg transition-shadow">
                            <CardHeader><CardTitle>Circa 2020</CardTitle></CardHeader>
                            <CardContent className="h-64 bg-muted/60 rounded-lg flex items-center justify-center p-2 overflow-hidden">
                                <Image
                                    src={`https://placehold.co/400x220.png?text=Green+Cover+2020&seed=${cityClimateData.greenCoverImageSeed2020}`}
                                    alt={`Simulated green cover for ${cityClimateData.cityNameForDisplay} around 2020`}
                                    width={400} height={220}
                                    className="rounded-md object-contain"
                                    data-ai-hint="urban sparse" />
                            </CardContent>
                        </Card>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 text-center">Conceptual comparison of vegetation. For actual data, refer to satellite imagery services (e.g., Landsat, Sentinel).</p>
                </div>
            )}


              {cityClimateData.isCoastal && cityClimateData.seaLevelRiseSimulated !== "N/A (not coastal or limited data)" && (
                 <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
                    <CardHeader><CardTitle>Sea Level Rise Overlay (Conceptual)</CardTitle></CardHeader>
                    <CardContent className="h-80 bg-muted/60 rounded-lg flex items-center justify-center p-2 overflow-hidden">
                         <Image src={`https://placehold.co/600x320.png?text=Sea+Level+Impact&seed=${cityClimateData.mapImageSeed}Sea`} alt={`Conceptual sea level rise map for ${searchedCityName}`} width={600} height={320} className="rounded-md object-contain transition-transform duration-500 hover:scale-105" data-ai-hint="sea level map" />
                    </CardContent>
                </Card>
              )}
              <p className="text-xs text-muted-foreground mt-6 p-3 bg-muted/50 rounded-md">Note: Long-term trend data, AQI, events, and ranks are simulated for illustrative purposes. Current weather data is from OpenWeatherMap (API Key: {process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY || '4f1ac5599d44ab59ce01b0857a3ce07e'}).</p>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}

interface InfoCardProps {
  icon: React.ElementType;
  title: string;
  value: string;
  unit?: string;
  iconUrl?: string | null;
  valueClassName?: string;
}

const InfoCard = ({ icon: Icon, title, value, unit, iconUrl, valueClassName }: InfoCardProps) => (
  <Card className="shadow-md hover:shadow-lg hover:scale-[1.03] transform transition-all duration-300 ease-out">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {iconUrl ? (
        <Image src={iconUrl} alt={title} width={28} height={28} className="h-7 w-7" />
      ) : (
        <Icon className="h-5 w-5 text-primary" />
      )}
    </CardHeader>
    <CardContent>
      <div className={cn("text-2xl font-bold", valueClassName)}>{value}</div>
      {unit && <p className="text-xs text-muted-foreground">{unit}</p>}
    </CardContent>
  </Card>
);
