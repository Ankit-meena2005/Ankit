// Central mock data store for FarmSOS modules.
// Mirrors what Supabase schema will hold. All modules read/write through here
// so the app stays functional even without a configured backend.

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

const CROPS = ['Wheat', 'Mustard', 'Bajra', 'Gram', 'Soybean', 'Maize', 'Cotton', 'Barley']

export const farms: Farm[] = [
  {
    id: 'f1',
    farmer_name: 'Ankit Meena',
    farm_name: 'Meena Krishi Farm',
    location: 'Kota, Rajasthan',
    state: 'Rajasthan',
    farm_size_acres: 4.5,
    soil_type: 'Loamy (Alluvial)',
    water_source: 'Tube Well',
    primary_crop: 'Wheat',
    historical_yield: [
      { season: 'Rabi', crop: 'Wheat', yield_qty: 18, year: 2023 },
      { season: 'Kharif', crop: 'Bajra', yield_qty: 12, year: 2023 },
      { season: 'Rabi', crop: 'Mustard', yield_qty: 9, year: 2024 },
      { season: 'Rabi', crop: 'Wheat', yield_qty: 21, year: 2024 }
    ],
    health_score: 78,
    productivity_score: 71,
    created_at: '2025-01-12'
  }
]

export const soilReports: SoilReport[] = [
  {
    id: 's1', farm_id: 'f1', ph: 7.2, nitrogen: 220, phosphorus: 38,
    potassium: 165, organic_carbon: 0.62, ec: 0.42, status: 'Moderate',
    uploaded_at: '2025-03-04'
  }
]

export const marketListings: MarketListing[] = [
  { id: 'm1', category: 'Seeds', name: 'HD-2967 Wheat Seed', brand: 'IFFCO', price: 2400, unit: 'bag 40kg', rating: 4.6, reviews: 312, image: 'wheat', description: 'High yielding dwarf variety, ideal for Rabi.' },
  { id: 'm2', category: 'Seeds', name: 'Pusa Mustard 28', brand: 'IARI', price: 380, unit: 'kg', rating: 4.4, reviews: 128, image: 'mustard', description: 'Early maturity variety with high oil content.' },
  { id: 'm3', category: 'Fertilizers', name: 'NPK 10-26-26', brand: 'Coromandel', price: 1400, unit: 'bag 50kg', rating: 4.5, reviews: 540, image: 'npk', description: 'Balanced complex fertilizer for root development.' },
  { id: 'm4', category: 'Fertilizers', name: 'Urea (Neem Coated)', brand: 'Chambal', price: 266, unit: 'bag 45kg', rating: 4.7, reviews: 980, image: 'urea', description: 'Subsidized nitrogen source, slow release.' },
  { id: 'm5', category: 'Pesticides', name: 'Chlorpyriphos 20 EC', brand: 'Dhanuka', price: 540, unit: 'litre', rating: 4.2, reviews: 210, image: 'chem', description: 'Broad-spectrum insecticide for stem borer.' },
  { id: 'm6', category: 'Pesticides', name: 'Mancozeb 75 WP', brand: 'Indofil', price: 360, unit: 'kg', rating: 4.3, reviews: 178, image: 'chem', description: 'Contact fungicide for blight control.' },
  { id: 'm7', category: 'Equipment', name: 'Seed Drill 9-Tine', brand: 'Ks Group', price: 32000, unit: 'unit', rating: 4.5, reviews: 64, image: 'drill', description: 'Tractor-mounted seed drill with fertilizer attachment.' },
  { id: 'm8', category: 'Equipment', name: 'Drip Irrigation Kit', brand: 'Netafim', price: 18500, unit: 'acre kit', rating: 4.8, reviews: 222, image: 'drip', description: 'Water-saving drip kit with venturi injector.' }
]

export const communityPosts: CommunityPost[] = [
  { id: 'c1', author: 'Ramesh S.', group: 'Wheat Farmers', title: 'Yellow rust outbreak near Bundi?', body: 'Noticing yellow stripes on leaves. Anyone else seeing this in Hadoti region?', replies: 7, created_at: '2025-03-18' },
  { id: 'c2', author: 'Sunita D.', group: 'Mustard Growers', title: 'Best sowing time for Pusa 28 this year', body: 'Delayed monsoon has shifted my calendar. Suggestions for Kota?', replies: 12, created_at: '2025-03-15' },
  { id: 'c3', author: 'Dr. Verma', group: 'Expert Q&A', title: 'Re: Soil testing labs in Hadoti', body: 'KVK Bundi and Agri University Kota both accept samples. Turnaround ~7 days.', replies: 3, created_at: '2025-03-20' }
]

export const jobListings: JobListing[] = [
  { id: 'j1', title: 'Farm Operations Manager', type: 'Full-time', location: 'Kota, RJ', salary: '₹35,000/mo', posted: '2d ago' },
  { id: 'j2', title: 'Harvest Labour (Rabi)', type: 'Seasonal', location: 'Baran, RJ', salary: '₹450/day', posted: '5d ago' },
  { id: 'j3', title: 'AgriTech Research Intern', type: 'Internship', location: 'Remote', salary: '₹15,000/mo', posted: '1d ago' },
  { id: 'j4', title: 'Co-founder — Drone spraying startup', type: 'Startup', location: 'Jaipur, RJ', salary: 'Equity', posted: '6d ago' }
]

export const alerts: Alert[] = [
  { id: 'a1', type: 'Heatwave', title: 'Heatwave warning — Kota & Baran', severity: 'High', region: 'Hadoti', published_at: '2025-03-21' },
  { id: 'a2', type: 'Pest', title: 'Armyworm risk rising in wheat belt', severity: 'Moderate', region: 'Eastern RJ', published_at: '2025-03-19' },
  { id: 'a3', type: 'Advisory', title: 'ICAR advisory: optimize irrigation for grain filling stage', severity: 'Low', region: 'Statewide', published_at: '2025-03-20' },
  { id: 'a4', type: 'Flood', title: 'Minor flooding risk — Chambal catchment', severity: 'Low', region: 'Kota', published_at: '2025-03-17' }
]

export const nearbyServices: NearbyService[] = [
  { id: 'n1', name: 'Krishi Vigyan Kendra Kota', category: 'KVK', distance_km: 6.2, address: 'Borawand, Kota', phone: '+919000000001', whatsapp: '+919000000001', lat: 25.2138, lng: 75.8648 },
  { id: 'n2', name: 'Agriculture University Kota', category: 'University', distance_km: 9.4, address: 'Rawatbhata Rd, Kota', phone: '+919000000002', whatsapp: '+919000000002', lat: 25.18, lng: 75.82 },
  { id: 'n3', name: 'Soil Testing Lab — Dept. of Agri', category: 'Soil Lab', distance_km: 4.1, address: 'Pologround, Kota', phone: '+919000000003', whatsapp: '+919000000003', lat: 25.19, lng: 75.86 },
  { id: 'n4', name: 'Shree Fertilizer & Seed Center', category: 'Fertilizer Shop', distance_km: 2.0, address: 'Main Market, Kota', phone: '+919000000004', whatsapp: '+919000000004', lat: 25.22, lng: 75.87 },
  { id: 'n5', name: 'Beej Nigam Seed Store', category: 'Seed Shop', distance_km: 3.3, address: 'Indra Vihar, Kota', phone: '+919000000005', whatsapp: '+919000000005', lat: 25.21, lng: 75.85 },
  { id: 'n6', name: 'Meena Tractor Rental', category: 'Tractor Rental', distance_km: 5.5, address: 'Village Rathola', phone: '+919000000006', whatsapp: '+919000000006', lat: 25.27, lng: 75.91 },
  { id: 'n7', name: 'Hadoti Cold Storage', category: 'Cold Storage', distance_km: 12.0, address: 'Choumuhan, Kota', phone: '+919000000007', whatsapp: '+919000000007', lat: 25.16, lng: 75.79 },
  { id: 'n8', name: 'Central Warehouse — FCI', category: 'Warehouse', distance_km: 14.2, address: 'Dadabari, Kota', phone: '+919000000008', whatsapp: '+919000000008', lat: 25.15, lng: 75.78 },
  { id: 'n9', name: 'Joint Director Agriculture Office', category: 'Govt Office', distance_km: 7.0, address: 'Zonal Office, Kota', phone: '+919000000009', whatsapp: '+919000000009', lat: 25.2, lng: 75.84 }
]

// Mandi price series (₹ per quintal) for forecasting
export const mandiPrices = {
  Wheat: [2125, 2180, 2200, 2170, 2240, 2280, 2310, 2295, 2340, 2380, 2400, 2420],
  Mustard: [5100, 5240, 5180, 5300, 5420, 5380, 5510, 5640, 5590, 5720, 5800, 5890],
  Bajra: [2250, 2280, 2210, 2340, 2410, 2390, 2480, 2520, 2490, 2580, 2640, 2690],
  Gram: [5200, 5180, 5240, 5360, 5420, 5510, 5480, 5620, 5740, 5810, 5900, 5980]
}

// Irrigation water needs (litres per m² per day) by growth stage
export const irrigationNeeds = {
  Wheat: { stages: ['Tillering', 'Jointing', 'Heading', 'Grain filling'], baseEt: [1.8, 3.2, 4.8, 3.5] },
  Mustard: { stages: [' Rosette ', 'Bolting', 'Flowering', 'Pod'], baseEt: [1.4, 2.6, 4.2, 3.0] },
  Bajra: { stages: ['Seedling', 'Tillering', 'Flowering', 'Grain'], baseEt: [1.5, 2.9, 4.6, 3.2] },
  Gram: { stages: ['Vegetative', 'Branching', 'Flowering', 'Pod'], baseEt: [1.2, 2.2, 3.6, 2.7] }
}

export const cropCatalog = CROPS.map((c) => ({
  name: c,
  baseYieldQtlPerAcre: 8 + Math.round(Math.random() * 14),
  marketPrice: (mandiPrices as any)[c]?.at(-1) ?? 2400,
  waterNeed: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
  growthDays: 90 + Math.floor(Math.random() * 50)
}))

export function uuid() {
  return 'id-' + Math.random().toString(36).slice(2, 10)
}
