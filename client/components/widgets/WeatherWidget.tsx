'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Wind, Droplets, ChevronDown, Search, Loader2, Navigation } from 'lucide-react';

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  locationName: string;
}

function getWeatherIcon(code: number) {
  if (code <= 1) return Sun;
  if (code <= 3) return Cloud;
  if (code >= 51 && code <= 67) return CloudRain;
  if (code >= 71 && code <= 77) return CloudSnow;
  if (code >= 80 && code <= 82) return CloudRain;
  if (code >= 95 && code <= 99) return CloudLightning;
  return Cloud;
}

function getWeatherLabel(code: number) {
  if (code === 0) return 'Clear sky';
  if (code <= 3) return 'Partly cloudy';
  if (code >= 51 && code <= 55) return 'Drizzle';
  if (code >= 56 && code <= 67) return 'Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Rain showers';
  if (code >= 85 && code <= 86) return 'Snow showers';
  if (code >= 95) return 'Thunderstorm';
  return 'Cloudy';
}

interface GeoResult {
  name: string;
  latitude: number;
  longitude: number;
  admin1?: string;
  country?: string;
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeoResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [defaulted, setDefaulted] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const fetchWeather = async (lat: number, lon: number, presetName?: string) => {
    setLoading(true);
    setError(false);
    try {
      // Get weather from Open-Meteo (free, no API key)
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`
      );
      const weatherData = await weatherRes.json();

      // Get location name from reverse geocoding (unless we already have one)
      let locationName = presetName || 'Your Area';
      if (!presetName) {
        try {
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
          );
          const geoData = await geoRes.json();
          locationName =
            geoData.address?.city ||
            geoData.address?.town ||
            geoData.address?.village ||
            geoData.address?.state ||
            'Your Area';
        } catch {}
      }

      setWeather({
        temperature: Math.round(weatherData.current.temperature_2m),
        humidity: weatherData.current.relative_humidity_2m,
        windSpeed: Math.round(weatherData.current.wind_speed_10m),
        weatherCode: weatherData.current.weather_code,
        locationName,
      });
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const useMyLocation = () => {
    setShowPicker(false);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeather(6.5244, 3.3792, 'Lagos'),
        { timeout: 5000 }
      );
    } else {
      fetchWeather(6.5244, 3.3792, 'Lagos');
    }
  };

  const selectLocation = (loc: GeoResult) => {
    const label = [loc.name, loc.admin1, loc.country].filter(Boolean).join(', ');
    fetchWeather(loc.latitude, loc.longitude, label);
    setShowPicker(false);
    setQuery('');
    setResults([]);
  };

  // Search cities as the user types
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
            query.trim()
          )}&count=6&language=en&format=json`,
          { signal: controller.signal }
        );
        const data = await res.json();
        setResults(data.results || []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  // Close picker on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    // Load saved default location if present, otherwise use my location
    const saved = localStorage.getItem('weatherDefault');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as { name: string };
        const match = results.find((r) => r.name === parsed.name);
        if (match) {
          selectLocation(match);
          return;
        }
        // Fallback: search for the saved name
        fetchWeather(6.5244, 3.3792, parsed.name);
        return;
      } catch {}
    }
    useMyLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setAsDefault = () => {
    if (!weather) return;
    localStorage.setItem(
      'weatherDefault',
      JSON.stringify({ name: weather.locationName })
    );
    setDefaulted(true);
    setTimeout(() => setDefaulted(false), 2000);
  };

  const WeatherIcon = weather ? getWeatherIcon(weather.weatherCode) : Cloud;

  return (
    <div ref={pickerRef} className="relative bg-white/10 backdrop-blur-md rounded-xl px-4 py-3 text-white min-w-[220px]">
      {loading ? (
        <div className="flex items-center gap-2 text-white/60 text-sm py-2">
          <div className="w-4 h-4 rounded-full bg-white/20 animate-pulse" />
          <span>Loading weather...</span>
        </div>
      ) : error || !weather ? (
        <div className="text-white/60 text-sm py-2">Weather unavailable</div>
      ) : (
        <>
          <div className="flex items-start gap-3">
            <div className="flex items-center gap-2">
              <WeatherIcon className="h-8 w-8 text-secondary" />
              <div>
                <div className="text-2xl font-bold leading-none">
                  {weather.temperature}°C
                </div>
                <div className="text-xs text-white/70 mt-0.5">
                  {getWeatherLabel(weather.weatherCode)}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-2 pt-2 border-t border-white/10 text-xs text-white/70">
            <span className="flex items-center gap-1">
              <Droplets className="h-3 w-3" />
              {weather.humidity}%
            </span>
            <span className="flex items-center gap-1">
              <Wind className="h-3 w-3" />
              {weather.windSpeed} km/h
            </span>
          </div>
        </>
      )}

      {/* Location selector */}
      <button
        onClick={() => setShowPicker((s) => !s)}
        className="flex items-center gap-1 mt-2 text-xs text-white/60 hover:text-white transition-colors w-full"
      >
        <MapPin className="h-3 w-3" />
        <span className="truncate">{weather?.locationName || 'Choose location'}</span>
        <ChevronDown className={`h-3 w-3 ml-auto transition-transform ${showPicker ? 'rotate-180' : ''}`} />
      </button>

      {weather && !showPicker && (
        <button
          onClick={setAsDefault}
          className="mt-1.5 w-full text-[10px] uppercase tracking-wide font-semibold text-secondary hover:text-white transition-colors"
        >
          {defaulted ? '✓ Default saved' : 'Set as default'}
        </button>
      )}

      {showPicker && (
        <div className="absolute left-0 right-0 top-full mt-2 z-20 bg-neutral-900/95 backdrop-blur-md rounded-xl border border-white/10 p-2 shadow-xl">
            <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (results.length > 0) {
                    selectLocation(results[0]);
                  } else if (weather) {
                    setAsDefault();
                  }
                }
              }}
              placeholder="Search city...  (Enter to set as default)"
              className="w-full pl-7 pr-2 py-1.5 rounded-lg bg-white/10 text-white text-sm placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-secondary"
            />
          </div>

          {weather && (
            <button
              onClick={setAsDefault}
              className="flex items-center justify-center gap-1 w-full mt-1.5 px-2 py-1.5 rounded-lg text-[10px] uppercase tracking-wide font-semibold text-secondary hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
            >
              {defaulted ? '✓ Default saved' : 'Set current as default'}
            </button>
          )}

          <button
            onClick={useMyLocation}
            className="flex items-center gap-2 w-full mt-1.5 px-2 py-1.5 rounded-lg text-xs text-white/80 hover:bg-white/10 transition-colors"
          >
            <Navigation className="h-3.5 w-3.5 text-secondary" />
            Use my current location
          </button>

          <div className="mt-1 max-h-48 overflow-y-auto">
            {searching && (
              <div className="flex items-center gap-2 px-2 py-2 text-xs text-white/50">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Searching...
              </div>
            )}
            {!searching &&
              results.map((loc, i) => (
                <button
                  key={`${loc.latitude}-${loc.longitude}-${i}`}
                  onClick={() => selectLocation(loc)}
                  className="block w-full text-left px-2 py-1.5 rounded-lg text-xs text-white/80 hover:bg-white/10 transition-colors"
                >
                  <span className="font-medium">{loc.name}</span>
                  {(loc.admin1 || loc.country) && (
                    <span className="text-white/40">
                      {' '}
                      · {[loc.admin1, loc.country].filter(Boolean).join(', ')}
                    </span>
                  )}
                </button>
              ))}
            {!searching && query.trim().length >= 2 && results.length === 0 && (
              <div className="px-2 py-2 text-xs text-white/40">No cities found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
