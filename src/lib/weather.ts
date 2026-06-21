// Lightweight weather helper using OpenWeatherMap free tier when configured.
// Falls back to deterministic mock data so the app always works.
import { useEffect, useState } from 'react'

export type Weather = {
  tempC: number
  humidity: number
  rainMM: number
  description: string
  nextRainDays: number
  weekly: { day: string; rainMM: number; tempC: number }[]
}

const KOTA = { lat: 25.21, lon: 75.86 }

export function useWeather(city = 'Kota,IN'): { weather: Weather; loading: boolean } {
  const [weather, setWeather] = useState<Weather>(mockWeather())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const key = import.meta.env.VITE_OPENWEATHER_KEY as string | undefined
    if (!key) { setLoading(false); setWeather(mockWeather()); return }

    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${key}&units=metric&cnt=7`)
      .then((r) => r.json())
      .then((d) => {
        if (!d?.list) throw new Error('bad')
        const list = d.list.map((x: any) => ({
          day: new Date(x.dt_txt).toLocaleDateString('en', { weekday: 'short' }),
          rainMM: +(x.rain?.['3h'] ?? 0),
          tempC: Math.round(x.main.temp)
        }))
        const today = list[0]
        const nextRainDays = list.findIndex((x: any) => x.rainMM > 1)
        setWeather({
          tempC: today.tempC,
          humidity: 60,
          rainMM: today.rainMM,
          description: d.list[0].weather[0].main,
          nextRainDays: nextRainDays === -1 ? 6 : nextRainDays,
          weekly: list
        })
      })
      .catch(() => setWeather(mockWeather()))
      .finally(() => setLoading(false))
  }, [city])

  void KOTA
  return { weather, loading }
}

function mockWeather(): Weather {
  return {
    tempC: 29,
    humidity: 58,
    rainMM: 0,
    description: 'Clear sky',
    nextRainDays: 3,
    weekly: [
      { day: 'Mon', rainMM: 0, tempC: 29 },
      { day: 'Tue', rainMM: 0, tempC: 31 },
      { day: 'Wed', rainMM: 4, tempC: 28 },
      { day: 'Thu', rainMM: 6, tempC: 27 },
      { day: 'Fri', rainMM: 1, tempC: 28 },
      { day: 'Sat', rainMM: 0, tempC: 30 },
      { day: 'Sun', rainMM: 0, tempC: 32 }
    ]
  }
}
