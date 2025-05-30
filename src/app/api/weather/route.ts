
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const OPENWEATHERMAP_API_KEY = process.env.OPENWEATHERMAP_API_KEY;
const OPENWEATHERMAP_API_URL = 'https://api.openweathermap.org/data/2.5/weather';

export async function GET(request: NextRequest) {
  if (!OPENWEATHERMAP_API_KEY) {
    return NextResponse.json({ error: 'OpenWeatherMap API key is not configured.' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  let apiUrl = '';

  if (city) {
    apiUrl = `${OPENWEATHERMAP_API_URL}?q=${city}&appid=${OPENWEATHERMAP_API_KEY}&units=metric`;
  } else if (lat && lon) {
    apiUrl = `${OPENWEATHERMAP_API_URL}?lat=${lat}&lon=${lon}&appid=${OPENWEATHERMAP_API_KEY}&units=metric`;
  } else {
    return NextResponse.json({ error: 'City or coordinates are required.' }, { status: 400 });
  }

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: `Failed to fetch weather data: ${errorData.message || response.statusText}` }, { status: response.status });
    }
    const data = await response.json();
    
    // Transform data to a more usable format for the frontend
    const transformedData = {
      city: data.name,
      country: data.sys?.country,
      temperature: data.main?.temp,
      feelsLike: data.main?.feels_like,
      tempMin: data.main?.temp_min,
      tempMax: data.main?.temp_max,
      pressure: data.main?.pressure,
      humidity: data.main?.humidity,
      visibility: data.visibility,
      windSpeed: data.wind?.speed,
      windDeg: data.wind?.deg,
      cloudiness: data.clouds?.all,
      weatherMain: data.weather?.[0]?.main,
      weatherDescription: data.weather?.[0]?.description,
      weatherIcon: data.weather?.[0]?.icon ? `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png` : null,
      sunrise: data.sys?.sunrise, // Unix timestamp
      sunset: data.sys?.sunset,   // Unix timestamp
      timezone: data.timezone,     // Shift in seconds from UTC
      coordinates: {
        lat: data.coord?.lat,
        lon: data.coord?.lon,
      },
      rainVolumeLastHour: data.rain?.['1h'],
      snowVolumeLastHour: data.snow?.['1h'],
      timestamp: data.dt, // Unix timestamp of data calculation
    };

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while fetching weather data.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
