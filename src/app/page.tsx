
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, Thermometer, Droplets, Waves, Wind, Filter, CloudSun, Info, TrendingUp, Snowflake, Map as MapIcon, Smile, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";


interface WeatherMetric {
  value: string;
  description: string;
  city?: string;
  icon?: React.ElementType;
  colorClass?: string;
  iconUrl?: string | null;
}

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
  sunrise: number;
  sunset: number;
  timezone: number;
  coordinates: {
    lat: number;
    lon: number;
  };
  rainVolumeLastHour?: number;
  snowVolumeLastHour?: number;
  timestamp: number;
}

const availableCities = [
    { name: "London", lat: 51.5074, lon: 0.1278, country: "GB" },
    { name: "New York", lat: 40.7128, lon: -74.0060, country: "US" },
    { name: "Tokyo", lat: 35.6895, lon: 139.6917, country: "JP" },
    { name: "Paris", lat: 48.8566, lon: 2.3522, country: "FR" },
    { name: "Berlin", lat: 52.5200, lon: 13.4050, country: "DE" },
    { name: "Cairo", lat: 30.0444, lon: 31.2357, country: "EG" },
    { name: "Sydney", lat: -33.8688, lon: 151.2093, country: "AU" },
    { name: "Rio de Janeiro", lat: -22.9068, lon: -43.1729, country: "BR" },
    { name: "Moscow", lat: 55.7558, lon: 37.6173, country: "RU" },
    { name: "Mumbai", lat: 19.0760, lon: 72.8777, country: "IN" },
    { name: "Beijing", lat: 39.9042, lon: 116.4074, country: "CN" },
    { name: "Cape Town", lat: -33.9249, lon: 18.4241, country: "ZA" },
    { name: "Buenos Aires", lat: -34.6037, lon: -58.3816, country: "AR" },
    { name: "Toronto", lat: 43.6532, lon: -79.3832, country: "CA" },
];

const getRandomElement = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const initialDashboardMetrics: WeatherMetric[] = [
  { value: "N/A", description: "Fetching temperature...", city: "London", icon: Thermometer, colorClass: "text-destructive" },
  { value: "N/A", description: "Fetching weather...", city: "London", icon: CloudSun, colorClass: "text-secondary" },
  { value: "Loading...", description: "Global atmospheric CO₂", icon: Wind, colorClass: "text-primary" },
  { value: "Loading...", description: "Global avg. sea level rise", icon: Waves, colorClass: "text-accent" },
  { value: "Loading...", description: "Arctic Sea Ice Anomaly", icon: Snowflake, colorClass: "text-blue-400" }, // Using a direct color for now, can theme
  { value: "Loading...", description: "Global Temp. Anomaly", icon: TrendingUp, colorClass: "text-orange-500" }, // Using a direct color for now, can theme
];


export default function DashboardPage() {
  const { toast } = useToast();
  const [dashboardCity, setDashboardCity] = useState(availableCities[0]);
  const [dashboardMetrics, setDashboardMetrics] = useState<WeatherMetric[]>(initialDashboardMetrics);
  const [metricsLoading, setMetricsLoading] = useState<boolean[]>([true, true, true, true, true, true]);
  const [timeRange, setTimeRange] = useState("real-time");
  const [currentTimestamp, setCurrentTimestamp] = useState<string | null>(null);

  useEffect(() => {
    // Set currentTimestamp only on the client-side after hydration
    setCurrentTimestamp(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, []);


  useEffect(() => {
    const fetchWeatherData = async (cityData: typeof availableCities[0]) => {
      setMetricsLoading(prev => [true, true, prev[2], prev[3], prev[4], prev[5]]);
      try {
        const response = await fetch(`/api/weather?lat=${cityData.lat}&lon=${cityData.lon}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to fetch weather for ${cityData.name}`);
        }
        const data: OpenWeatherData = await response.json();

        setDashboardMetrics(prevMetrics => {
            const newMetrics = [...prevMetrics];
            newMetrics[0] = {
                value: `${data.temperature.toFixed(1)}°C`,
                description: `Current in ${data.city}. Feels like ${data.feelsLike.toFixed(1)}°C. Min: ${data.tempMin.toFixed(1)}°C, Max: ${data.tempMax.toFixed(1)}°C. As of ${new Date(data.timestamp * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`,
                city: data.city,
                icon: Thermometer,
                colorClass: data.temperature > 30 ? "text-destructive" : data.temperature < 10 ? "text-blue-400" : "text-orange-500"
            };
            newMetrics[1] = {
                value: data.weatherDescription.charAt(0).toUpperCase() + data.weatherDescription.slice(1),
                description: `Conditions in ${data.city}: ${data.cloudiness}% clouds, ${data.humidity}% humidity. Wind: ${data.windSpeed.toFixed(1)} m/s. Sunrise: ${new Date(data.sunrise * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}, Sunset: ${new Date(data.sunset * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`,
                city: data.city,
                iconUrl: data.weatherIcon,
                icon: data.weatherIcon ? undefined : CloudSun,
                colorClass: "text-secondary"
            };
            return newMetrics;
        });
        setMetricsLoading(prev => [false, false, prev[2], prev[3], prev[4], prev[5]]);

      } catch (error) {
        console.error("Error fetching weather data for dashboard:", error);
        const errorTime = new Date().toLocaleTimeString();
        toast({
          title: "Weather Data Error",
          description: `Could not load real-time weather for ${cityData.name}. Displaying last known or simulated data. (Attempted: ${errorTime})`,
          variant: "destructive",
        });
         setDashboardMetrics(prevMetrics => {
            const newMetrics = [...prevMetrics];
            newMetrics[0].value = `~${(Math.random() * 15 + 5).toFixed(1)}°C`;
            newMetrics[0].description = `Error fetching data for ${cityData.name}. Approx. value. Last attempt: ${errorTime}`;
            if (newMetrics[0].city) newMetrics[0].city = cityData.name; else newMetrics[0].city = "Selected City";
            newMetrics[1].value = getRandomElement(["Partly Cloudy", "Scattered Showers", "Overcast", "Windy"]);
            newMetrics[1].description = `Error fetching data for ${cityData.name}. Conditions N/A. Last attempt: ${errorTime}`;
            if (newMetrics[1].city) newMetrics[1].city = cityData.name; else newMetrics[1].city = "Selected City";
            newMetrics[1].iconUrl = null;
            return newMetrics;
         });
         setMetricsLoading(prev => [false, false, prev[2], prev[3], prev[4], prev[5]]);
      }
    };

    if (dashboardCity?.name) {
        fetchWeatherData(dashboardCity);
    }

    const updateGlobalMetrics = () => {
        setMetricsLoading(prev => [prev[0], prev[1], true, true, true, true]);
        const now = new Date();
        setTimeout(() => {
            setDashboardMetrics(prevMetrics => {
                const newMetrics = [...prevMetrics];
                newMetrics[2] = {
                    value: `${(418 + Math.random() * 5).toFixed(1)} ppm`,
                    description: `Global atmospheric CO₂ (NOAA, Mauna Loa). Updated: ${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`,
                    icon: Wind,
                    colorClass: "text-primary"
                };
                newMetrics[3] = {
                    value: `+${(3.6 + Math.random() * 0.3).toFixed(1)} mm/yr`,
                    description: `Global avg. sea level rise (NASA/NOAA). Updated: ${now.toLocaleDateString()}`,
                    icon: Waves,
                    colorClass: "text-accent"
                };
                newMetrics[4] = { 
                    value: `-${(Math.random() * 1.5 + 0.5).toFixed(1)} M km²`,
                    description: `Arctic Sea Ice Extent Anomaly (vs 1981-2010 avg). Updated: ${now.toLocaleDateString()}`,
                    icon: Snowflake,
                    colorClass: "text-blue-400" // Example direct color
                };
                newMetrics[5] = { 
                    value: `+${(0.85 + Math.random() * 0.3).toFixed(2)}°C`,
                    description: `Global Land-Ocean Temp. Anomaly (vs 20th C. avg). Updated: ${now.toLocaleDateString()}`,
                    icon: TrendingUp,
                    colorClass: "text-orange-500" // Example direct color
                };
                return newMetrics;
            });
            setMetricsLoading(prev => [prev[0], prev[1], false, false, false, false]);
        }, 700 + Math.random() * 500);
    };

    updateGlobalMetrics(); 
    const intervalId = setInterval(updateGlobalMetrics, 45000 + Math.random() * 10000); 

    return () => clearInterval(intervalId); 

  }, [dashboardCity, toast]); 

  const handleFilterClick = () => {
    toast({
      title: "Filters Applied (Simulated)",
      description: "Showing data for selected filters. This is for demonstration and does not change displayed data.",
      variant: "default",
    });
  };

  const handleTimeRangeChange = (value: string) => {
     setTimeRange(value);
     const currentTimeVal = new Date().toLocaleTimeString();
     toast({title: "Time Range Changed (Simulated)", description: `Data view updated to ${value}. This is illustrative; data remains real-time or latest simulated. (${currentTimeVal})`});
     setDashboardMetrics(prev => prev.map((m, index) => {
        let baseDesc = "";
        if (index === 0) baseDesc = `Current in ${dashboardCity?.name || 'Selected City'}. Feels like...`;
        else if (index === 1) baseDesc = `Conditions in ${dashboardCity?.name || 'Selected City'}...`;
        else if (index === 2) baseDesc = `Global atmospheric CO₂ (NOAA, Mauna Loa).`;
        else if (index === 3) baseDesc = `Global avg. sea level rise (NASA/NOAA).`;
        else if (index === 4) baseDesc = `Arctic Sea Ice Extent Anomaly (vs 1981-2010 avg).`;
        else if (index === 5) baseDesc = `Global Land-Ocean Temp. Anomaly (vs 20th C. avg).`;
        return {...m, description: `${baseDesc} (View: ${value} - ${currentTimeVal})` };
     }));

     if (value === "real-time" && dashboardCity?.name) {
        const currentCity = dashboardCity;
        setDashboardCity({name: "", lat:0, lon:0, country:""}); 
        setTimeout(() => setDashboardCity(currentCity), 50); 
     }
  };

  const handleCityChange = (selectedCityName: string) => {
    const cityData = availableCities.find(c => c.name === selectedCityName);
    if (cityData && cityData.name !== (dashboardCity?.name || "")) { 
      setDashboardCity(cityData);
      toast({title: "Dashboard City Changed", description: `Now showing weather for ${cityData.name}.`});
    }
  };


  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-primary">Global Climate Dashboard</h1>
          <p className="text-muted-foreground mt-1">Visualize climate change (live weather for {dashboardCity?.name || "selected city"}, other data updated periodically).</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          <Select defaultValue={dashboardCity?.name} onValueChange={handleCityChange}>
            <SelectTrigger className="w-full sm:w-[180px] shadow-sm hover:shadow-md transition-shadow">
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent>
              {availableCities.map(city => (
                <SelectItem key={city.name} value={city.name}>{city.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select defaultValue={timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="w-full sm:w-[200px] shadow-sm hover:shadow-md transition-shadow">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="real-time">Real-time Data</SelectItem>
              <SelectItem value="past-24h">Past 24 Hours (Simulated)</SelectItem>
              <SelectItem value="past-7d">Past 7 Days (Simulated)</SelectItem>
              <SelectItem value="past-30d">Past 30 Days (Simulated)</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleFilterClick} className="w-full sm:w-auto shadow-sm hover:shadow-md transition-shadow">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      <Card className="shadow-xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl"><Globe className="text-primary h-7 w-7"/> Interactive Climate Map</CardTitle>
          <CardDescription>View the detailed interactive map for Mumbai (or other configured locations in future iterations).</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full max-w-xs mt-4 py-3 text-base shadow-md hover:shadow-lg transition-shadow">
                <MapIcon className="mr-2 h-5 w-5" /> Open Interactive Map
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[90vw] h-[90vh] p-0 flex flex-col sm:max-w-full">
              <DialogHeader className="p-4 border-b">
                <DialogTitle>Interactive Climate Map - Mumbai</DialogTitle>
                <DialogDescription>
                  This map displays various climate impact data for Mumbai. (Content from map.html)
                </DialogDescription>
              </DialogHeader>
              <div className="flex-grow">
                <iframe
                  src="/render-map"
                  width="100%"
                  height="100%"
                  title="Interactive Climate Map"
                  className="border-0"
                />
              </div>
            </DialogContent>
          </Dialog>
          <p className="text-sm text-muted-foreground mt-4 text-center">
            Click the button above to load the interactive map content from <code>map.html</code>.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {dashboardMetrics.map((metric, index) => {
          const IconComponent = metric.icon || TrendingUp;
          const isLoading = metricsLoading[index];
          return (
            <Card
              key={index}
              className={cn(
                "shadow-lg rounded-xl hover:shadow-2xl hover:-translate-y-1.5 transform transition-all duration-300 ease-out",
                isLoading ? "opacity-60 animate-pulse" : "opacity-100 animate-fade-in-up"
              )}
              style={{ animationDelay: `${0.3 + index * 0.1}s` }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                {isLoading ? <Skeleton className="h-5 w-3/4" /> : <CardTitle className="text-sm font-medium">{metric.icon ? `${metric.city ? metric.city + " - " : ""} ${metric.description.split('(')[0].split('.')[0].trim()}` : metric.description.split('(')[0].split('.')[0].trim()}</CardTitle>}
                {isLoading ? <Skeleton className="h-6 w-6 rounded-full" /> :
                  metric.iconUrl ? <Image src={metric.iconUrl} alt={metric.value} width={28} height={28} className="h-7 w-7" /> : <IconComponent className={`h-5 w-5 ${metric.colorClass || 'text-primary'}`} />
                }
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-8 w-1/2 my-1" /> : <div className={`text-3xl font-bold ${metric.colorClass || 'text-primary'}`}>{metric.value}</div>}
                {isLoading ? <Skeleton className="h-4 w-full mt-1" /> : <p className="text-xs text-muted-foreground truncate" title={metric.description}>{metric.description.includes('(') ? metric.description.substring(metric.description.indexOf('(')) : metric.description.split('.')[1] || 'Updated data'}</p>}
              </CardContent>
            </Card>
          );
        })}
      </div>

       <Card className="shadow-xl animate-fade-in-up" style={{ animationDelay: '1.0s' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl"><Info className="text-primary h-7 w-7"/>Data Source Information</CardTitle>
        </CardHeader>
        <CardContent>
            <ul className="list-disc list-inside text-sm space-y-2 text-foreground/90">
                <li><strong>Current Temperature & Weather:</strong> Real-time data for {dashboardCity?.name || "selected city"} via OpenWeatherMap API. Updates on city change. (API Key: {process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY ? 'Active' : 'Not Set - Using Fallback'})</li>
                <li><strong>CO₂ Emissions, Sea Level Change, Arctic Ice & Temp Anomaly:</strong> Global data points are simulated based on recent trends from sources like NOAA and NASA. Updated periodically for illustrative purposes. (Current client time for reference: {currentTimestamp || 'Loading...'})</li>
                <li><strong>Interactive Map:</strong> The map is loaded from an external <code>map.html</code> file and displayed in an iframe.</li>
                <li><strong>Time Range Selector:</strong> Illustrative, alters description text but not the core data source for this demo.</li>
            </ul>
            <p className="text-xs text-muted-foreground mt-4 p-3 bg-muted/50 rounded-md">This dashboard combines real-time weather information (where available) with simulated global climate trend data to provide a comprehensive overview. For in-depth climate analysis, please consult scientific reports and official climate data sources like IPCC, NOAA, NASA, and local meteorological agencies.</p>
        </CardContent>
      </Card>

      <Card className="shadow-xl animate-fade-in-up" style={{ animationDelay: '1.2s' }}>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2"><Smile className="text-yellow-500 h-7 w-7" /> A Little Extra Joy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-[4/3] bg-muted/70 rounded-lg flex items-center justify-center overflow-hidden shadow-inner">
            <Image
              src={`https://picsum.photos/seed/cuteBoyPlaceholder${currentTimestamp ? currentTimestamp.replace(/[\s:]/g, '') + 'Extra' : Date.now()}/400/300`}
              alt="Cute Boy Image Placeholder"
              width={400}
              height={300}
              className="rounded-md object-cover transition-opacity duration-700 ease-in-out opacity-0 data-[loaded=true]:opacity-100"
              onLoad={(e) => e.currentTarget.setAttribute('data-loaded', 'true')}
              data-ai-hint="cute boy"
              key={`cuteBoyPlaceholder${currentTimestamp ? currentTimestamp.replace(/[\s:]/g, '') + 'Extra' : Date.now()}`}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">Just a little something extra to brighten the page!</p>
        </CardContent>
      </Card>

    </div>
  );
}
