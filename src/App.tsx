import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './modules/Home'
import FarmTwin from './modules/FarmTwin'
import Satellite from './modules/Satellite'
import Planner from './modules/Planner'
import Irrigation from './modules/Irrigation'
import Soil from './modules/Soil'
import Market from './modules/Market'
import Prices from './modules/Prices'
import Jobs from './modules/Jobs'
import Finance from './modules/Finance'
import ImageAI from './modules/ImageAI'
import Community from './modules/Community'
import Alerts from './modules/Alerts'
import Rajasthan from './modules/Rajasthan'
import Services from './modules/Services'
import Analytics from './modules/Analytics'
import Admin from './modules/Admin'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/farm" element={<FarmTwin />} />
        <Route path="/satellite" element={<Satellite />} />
        <Route path="/planner" element={<Planner />} />
        <Route path="/irrigation" element={<Irrigation />} />
        <Route path="/soil" element={<Soil />} />
        <Route path="/market" element={<Market />} />
        <Route path="/prices" element={<Prices />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/finance" element={<Finance />} />
        <Route path="/image" element={<ImageAI />} />
        <Route path="/community" element={<Community />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/rajasthan" element={<Rajasthan />} />
        <Route path="/services" element={<Services />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Layout>
  )
}
