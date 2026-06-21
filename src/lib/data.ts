// Data-access layer for FarmSOS modules.
// Reads/writes from Supabase when configured (anon key client works due to
// single-tenant public RLS policies). Falls back to bundled defaults if the
// client is unavailable so the UI never breaks.

import { supabase, isSupabaseConfigured } from './supabase'

export type Farm = {
  id: string
  farmer_name: string
  farm_name: string
  location: string
  state: string
  farm_size_acres: number
  soil_type: string
  water_source: string
  primary_crop: string
  historical_yield: { season: string; crop: string; yield_qty: number; year: number }[]
  health_score: number
  productivity_score: number
  created_at: string
}

export type SoilReport = {
  id: string
  farm_id: string
  ph: number
  nitrogen: number
  phosphorus: number
  potassium: number
  organic_carbon: number
  ec: number
  status: 'Healthy' | 'Moderate' | 'Deficient'
  uploaded_at: string
}

export type MarketListing = {
  id: string
  category: 'Seeds' | 'Fertilizers' | 'Pesticides' | 'Equipment'
  name: string
  brand: string
  price: number
  unit: string
  rating: number
  reviews: number
  image: string
  description: string
}

export type CommunityPost = {
  id: string
  author: string
  group: string
  title: string
  body: string
  replies: number
  created_at: string
}

export type JobListing = {
  id: string
  title: string
  type: 'Full-time' | 'Seasonal' | 'Internship' | 'Startup'
  location: string
  salary: string
  posted: string
}

export type Alert = {
  id: string
  type: 'Flood' | 'Heatwave' | 'Pest' | 'Advisory'
  title: string
  severity: 'Low' | 'Moderate' | 'High' | 'Severe'
  region: string
  published_at: string
}

export type NearbyService = {
  id: string
  name: string
  category: string
  distance_km: number
  address: string
  phone: string
  whatsapp: string
  lat: number
  lng: number
}

export type DiseaseReport = {
  id?: string
  crop: string
  disease: string
  type: string
  confidence: number
  stage: string
  severity: string
  treatments: { kind: string; text: string }[]
}

// Defaults if Supabase not reachable / empty
const DEFAULT_FARMS: Farm[] = [
  {
    id: 'f1', farmer_name: 'Ankit Meena', farm_name: 'Meena Krishi Farm',
    location: 'Kota, Rajasthan', state: 'Rajasthan', farm_size_acres: 4.5,
    soil_type: 'Loamy (Alluvial)', water_source: 'Tube Well', primary_crop: 'Wheat',
    historical_yield: [
      { season: 'Rabi', crop: 'Wheat', yield_qty: 18, year: 2023 },
      { season: 'Kharif', crop: 'Bajra', yield_qty: 12, year: 2023 },
      { season: 'Rabi', crop: 'Mustard', yield_qty: 9, year: 2024 },
      { season: 'Rabi', crop: 'Wheat', yield_qty: 21, year: 2024 }
    ],
    health_score: 78, productivity_score: 71, created_at: '2025-01-12'
  }
]

const CROPS = ['Wheat', 'Mustard', 'Bajra', 'Gram', 'Soybean', 'Maize', 'Cotton', 'Barley']

// Mandi prices (₹/qtl) 12-month history per crop; used for forecasting
export const mandiPrices: Record<string, number[]> = {
  Wheat:   [2125, 2180, 2200, 2170, 2240, 2280, 2310, 2295, 2340, 2380, 2400, 2420],
  Mustard: [5100, 5240, 5180, 5300, 5420, 5380, 5510, 5640, 5590, 5720, 5800, 5890],
  Bajra:   [2250, 2280, 2210, 2340, 2410, 2390, 2480, 2520, 2490, 2580, 2640, 2690],
  Gram:    [5200, 5180, 5240, 5360, 5420, 5510, 5480, 5620, 5740, 5810, 5900, 5980]
}

export const irrigationNeeds: Record<string, { stages: string[]; baseEt: number[] }> = {
  Wheat:   { stages: ['Tillering', 'Jointing', 'Heading', 'Grain filling'], baseEt: [1.8, 3.2, 4.8, 3.5] },
  Mustard: { stages: ['Rosette', 'Bolting', 'Flowering', 'Pod'], baseEt: [1.4, 2.6, 4.2, 3.0] },
  Bajra:   { stages: ['Seedling', 'Tillering', 'Flowering', 'Grain'], baseEt: [1.5, 2.9, 4.6, 3.2] },
  Gram:    { stages: ['Vegetative', 'Branching', 'Flowering', 'Pod'], baseEt: [1.2, 2.2, 3.6, 2.7] }
}

export const cropCatalog = CROPS.map((c) => ({
  name: c,
  baseYieldQtlPerAcre: 8 + Math.round(Math.random() * 14),
  marketPrice: mandiPrices[c]?.at(-1) ?? 2400,
  waterNeed: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
  growthDays: 90 + Math.floor(Math.random() * 50)
}))

export function uuid() {
  return crypto.randomUUID ? crypto.randomUUID() : 'id-' + Math.random().toString(36).slice(2, 10)
}

// ---- Live data loaders (Supabase with fallback) ----------------------------

export async function fetchFarms(): Promise<Farm[]> {
  if (!isSupabaseConfigured) return DEFAULT_FARMS
  const { data, error } = await supabase
    .from('farms')
    .select('*')
    .order('created_at', { ascending: false })
  if (error || !data?.length) return DEFAULT_FARMS
  return data.map(mapFarm)
}

export async function createFarm(f: Partial<Farm>): Promise<Farm | null> {
  if (!isSupabaseConfigured) {
    const farm: Farm = {
      id: uuid(), farmer_name: f.farmer_name || 'New Farmer',
      farm_name: f.farm_name || 'Untitled Farm', location: f.location || 'Rajasthan',
      state: f.state || 'Rajasthan', farm_size_acres: f.farm_size_acres || 1,
      soil_type: f.soil_type || 'Loamy', water_source: f.water_source || 'Tube Well',
      primary_crop: f.primary_crop || 'Wheat', historical_yield: [],
      health_score: 50 + Math.floor(Math.random() * 40),
      productivity_score: 45 + Math.floor(Math.random() * 45),
      created_at: new Date().toISOString().slice(0, 10)
    }
    await supabase.from('farms').insert(farm)
    return farm
  }
  const insertRow = {
    farmer_name: f.farmer_name || 'New Farmer',
    farm_name: f.farm_name || 'Untitled Farm',
    location: f.location || 'Rajasthan',
    state: f.state || 'Rajasthan',
    farm_size_acres: f.farm_size_acres || 1,
    soil_type: f.soil_type || 'Loamy',
    water_source: f.water_source || 'Tube Well',
    primary_crop: f.primary_crop || 'Wheat',
    health_score: 50 + Math.floor(Math.random() * 40),
    productivity_score: 45 + Math.floor(Math.random() * 45)
  }
  const { data, error } = await supabase.from('farms').insert(insertRow).select().single()
  if (error || !data) return null
  return mapFarm(data)
}

export async function fetchSoilReport(farmId: string): Promise<SoilReport | null> {
  if (!isSupabaseConfigured) return null
  const { data } = await supabase
    .from('soil_reports')
    .select('*')
    .eq('farm_id', farmId)
    .order('uploaded_at', { ascending: false })
    .maybeSingle()
  if (!data) return null
  return {
    id: data.id, farm_id: data.farm_id, ph: +data.ph, nitrogen: +data.nitrogen,
    phosphorus: +data.phosphorus, potassium: +data.potassium,
    organic_carbon: +data.organic_carbon, ec: +data.ec, status: data.status,
    uploaded_at: data.uploaded_at
  }
}

export async function fetchMarketListings(): Promise<MarketListing[]> {
  if (!isSupabaseConfigured) return []
  const { data, error } = await supabase
    .from('market_listings')
    .select('*')
    .order('rating', { ascending: false })
  if (error || !data?.length) return []
  return data.map((d: any) => ({
    id: d.id, category: d.category, name: d.name, brand: d.brand, price: +d.price,
    unit: d.unit, rating: +d.rating, reviews: +d.reviews, image: d.image, description: d.description
  }))
}

export async function fetchCommunityPosts(): Promise<CommunityPost[]> {
  if (!isSupabaseConfigured) return []
  const { data, error } = await supabase
    .from('community_posts')
    .select('*')
    .order('created_at', { ascending: false })
  if (error || !data?.length) return []
  return data.map((d: any) => ({
    id: d.id, author: d.author, group: d.group_name, title: d.title, body: d.body,
    replies: +d.replies, created_at: String(d.created_at).slice(0, 10)
  }))
}

export async function createCommunityPost(p: { author: string; group: string; title: string; body: string }): Promise<void> {
  if (!isSupabaseConfigured) return
  await supabase.from('community_posts').insert({
    author: p.author, group_name: p.group, title: p.title, body: p.body
  })
}

export async function fetchAlerts(): Promise<Alert[]> {
  if (!isSupabaseConfigured) return []
  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .order('published_at', { ascending: false })
  if (error || !data?.length) return []
  return data.map((d: any) => ({
    id: d.id, type: d.type, title: d.title, severity: d.severity,
    region: d.region, published_at: String(d.published_at).slice(0, 10)
  }))
}

export async function fetchJobs(): Promise<JobListing[]> {
  if (!isSupabaseConfigured) return []
  const { data, error } = await supabase
    .from('job_listings')
    .select('*')
    .order('posted', { ascending: false })
  if (error || !data?.length) return []
  return data.map((d: any) => ({
    id: d.id, title: d.title, type: d.type, location: d.location,
    salary: d.salary, posted: d.posted
  }))
}

export async function fetchServices(): Promise<NearbyService[]> {
  if (!isSupabaseConfigured) return []
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('distance_km', { ascending: true })
  if (error || !data?.length) return []
  return data.map((d: any) => ({
    id: d.id, name: d.name, category: d.category, address: d.address,
    phone: d.phone, whatsapp: d.whatsapp, lat: +d.lat, lng: +d.lng,
    distance_km: +d.distance_km
  }))
}

export async function saveDiseaseReport(r: DiseaseReport): Promise<void> {
  if (!isSupabaseConfigured) return
  await supabase.from('disease_reports').insert({
    crop: r.crop, disease: r.disease, type: r.type, confidence: r.confidence,
    stage: r.stage, severity: r.severity, treatments: r.treatments
  })
}

function mapFarm(d: any): Farm {
  return {
    id: d.id, farmer_name: d.farmer_name, farm_name: d.farm_name,
    location: d.location, state: d.state, farm_size_acres: +d.farm_size_acres,
    soil_type: d.soil_type, water_source: d.water_source, primary_crop: d.primary_crop,
    historical_yield: Array.isArray(d.historical_yield) ? d.historical_yield : [],
    health_score: +d.health_score, productivity_score: +d.productivity_score,
    created_at: String(d.created_at).slice(0, 10)
  }
}
