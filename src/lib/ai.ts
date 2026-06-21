// Client for the FarmSOS AI edge function.
// Uses the Supabase Functions endpoint + anon key (verify_jwt is off).

const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/farmsos-ai`
const HEADERS = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
}

export type PlannerResult = {
  ranked: { name: string; score: number; yieldQtl: number; revenue: number; profit: number; waterNeed: string; growthDays: number; marketPrice: number }[]
  best: { name: string; score: number; yieldQtl: number; revenue: number; profit: number; waterNeed: string; growthDays: number; marketPrice: number }
}

export type SoilAdvice = {
  recommendations: { kind: string; text: string }[]
  status: string
}

export type ImageResult = {
  disease: string
  type: string
  confidence: number
  stage: string
  severity: string
  treatments: { kind: string; text: string }[]
  crop?: string
}

export type AssistantResult = { reply: string }

async function call<T>(body: any): Promise<T> {
  try {
    const r = await fetch(FN_URL, {
      method: 'POST', headers: HEADERS,
      body: JSON.stringify(body)
    })
    if (!r.ok) throw new Error('AI request failed: ' + r.status)
    const j = await r.json()
    if (j && j.error) throw new Error(j.error)
    return j as T
  } catch (e) {
    // Network/edge failure — caller can fall back to local logic
    throw e
  }
}

export const ai = {
  planner: (input: { soil: string; water: string; marketTrend: string; weatherRain: number }) =>
    call<PlannerResult>({ action: 'planner', ...input }),
  soil: (report: any) =>
    call<SoilAdvice>({ action: 'soil', report }),
  image: (imageBase64: string, mime = 'image/jpeg') =>
    call<ImageResult>({ action: 'image', imageBase64, mime }),
  assistant: (prompt: string) =>
    call<AssistantResult>({ action: 'assistant', prompt })
}
