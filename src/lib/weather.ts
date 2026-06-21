// Weather + geocoding using 100% free, no-key APIs.
// - Open-Meteo: forecast & historical (https://open-meteo.com)
// - Nominatim (OpenStreetMap) geocoding for city→coords

import { useEffect, useState } from 'react'

export type Weather = {
  tempC: number
  humidity: number
  rainMM: number
  description: string
  nextRainDays: number
  weekly: { day: string; rainMM: number; tempC: number }[]
}

const codeDesc: Record<number, string> = {
  0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Fog', 48: 'Rime fog', 51: 'Light drizzle', 53: 'Drizzle', 55: 'Dense drizzle',
  61: 'Light rain', 63: 'Rain', 65: 'Heavy rain', 71: 'Light snow', 73: 'Snow', 75: 'Heavy snow',
  80: 'Rain showers', 81: 'Showers', 82: 'Violent showers', 95: 'Thunderstorm', 96: 'Storm w/ hail', 99: 'Severe storm'
}

const DEFAULT: Weather = {
  tempC: 29, humidity: 58, rainMM: 0, description: 'Clear sky',
  nextRainDays: 3,
  weekly: [
    { day: 'Mon', rainMM: 0, tempC: 29 }, { day: 'Tue', rainMM: 0, tempC: 31 },
    { day: 'Wed', rainMM: 4, tempC: 28 }, { day: 'Thu', rainMM: 6, tempC: 27 },
    { day: 'Fri', rainMM: 1, tempC: 28 }, { day: 'Sat', rainMM: 0, tempC: 30 },
    { day: 'Sun', rainMM: 0, tempC: 32 }
  ]
}

export async function geocodeCity(city: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`,
      { headers: { 'Accept-Language': 'en' } }
    )
    const j = await r.json()
    if (Array.isArray(j) && j[0]) return { lat: +j[0].lat, lng: +j[0].lon }
  } catch { /* fall through */ }
  return null
}

export async function fetchWeather(city = 'Kota, Rajasthan'): Promise<Weather> {
  const geo = await geocodeCity(city) ?? { lat: 25.2138, lng: 75.8648 }
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${geo.lat}&longitude=${geo.lng}&daily=temperature_2m_max,precipitation_sum,weather_code&current=temperature_2m,relative_humidity_2m,precipitation,weather_code&timezone=auto&forecast_days=7`
    const r = await fetch(url)
    if (!r.ok) throw new Error('weather fail')
    const j = await r.json()

    const weekly = j.daily.time.map((t: string, i: number) => ({
      day: new Date(t).toLocaleDateString('en', { weekday: 'short' }),
      rainMM: +(j.daily.precipitation_sum[i] ?? 0),
      tempC: Math.round(j.daily.temperature_2m_max[i])
    }))
    const nextRainIdx = weekly.findIndex((w: any) => w.rainMM > 1)
    return {
      tempC: Math.round(j.current.temperature_2m),
      humidity: Math.round(j.current.relative_humidity_2m),
      rainMM: +(j.current.precipitation ?? 0),
      description: codeDesc[j.current.weather_code] ?? 'Clear',
      nextRainDays: nextRainIdx === -1 ? 7 : nextRainIdx,
      weekly
    }
  } catch {
    return DEFAULT
  }
}

export function useWeather(city = 'Kota, Rajasthan'): { weather: Weather; loading: boolean } {
  const [weather, setWeather] = useState<Weather>(DEFAULT)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let alive = true
    fetchWeather(city).then((w) => { if (alive) { setWeather(w); setLoading(false) } })
    return () => { alive = false }
  }, [city])
  return { weather, loading }
}

// Haversine distance between two lat/lng points (km)
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371
  const dLat = (b.lat - a.lat) * Math.PI / 180
  const dLng = (b.lng - a.lng) * Math.PI / 180
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}
