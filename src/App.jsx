import { BrowserRouter, Routes, Route } from 'react-router-dom'
import FarmerDashboard from './pages/FarmerDashboard'
import Landing from './pages/Landing'
import BuyerMarketplace from './pages/BuyerMarketplace'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<FarmerDashboard />} />
        <Route path="/marketplace" element={<BuyerMarketplace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App