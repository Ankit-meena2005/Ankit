import { type ReactNode } from 'react'
import Navbar from './Navbar'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-night-950 text-night-50">
      <Navbar />
      <main className="pt-16">{children}</main>
      <footer className="border-t border-night-800 bg-night-950 py-10">
        <div className="container-app grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 font-display font-bold">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700">🌾</span>
              Farm<span className="gradient-text">SOS</span>
            </div>
            <p className="mt-3 text-sm text-night-400">
              AI-powered farming platform built for Indian smallholders. From soil testing to mandi prices — one app, every season.
            </p>
          </div>
          <FooterCol title="Platform" links={['Digital Farm Twin', 'Satellite NDVI', 'AI Crop Planner', 'Soil Analyzer']} />
          <FooterCol title="Services" links={['Marketplace', 'Price Forecast', 'Jobs Portal', 'Finance Center']} />
          <FooterCol title="Company" links={['About', 'Careers', 'Privacy', 'Contact']} />
        </div>
        <div className="container-app mt-8 border-t border-night-800 pt-6 text-sm text-night-500">
          © 2025 FarmSOS Technologies · Proudly built for Bharat 🇮🇳
        </div>
      </footer>
    </div>
  )
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-white">{title}</h4>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l}><span className="text-sm text-night-400 hover:text-brand-300 cursor-pointer">{l}</span></li>
        ))}
      </ul>
    </div>
  )
}
