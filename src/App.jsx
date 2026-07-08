import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProductDetail from './pages/ProductDetail'
import FarmerDashboard from './pages/FarmerDashboard'
import Landing from './pages/Landing'
import BuyerMarketplace from './pages/BuyerMarketplace'
import OrderTracking from './pages/OrderTracking'
import BuyerOrderHistory from './pages/BuyerOrderHistory'
import TransporterLoadBoard from './pages/TransporterLoadBoard'
import RatingsReviews from './pages/RatingsReviews'
import USSDSimulator from './pages/USSDSimulator'
import Auth from './pages/Auth'
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<FarmerDashboard />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/marketplace" element={<BuyerMarketplace />} />
        <Route path="/buyer-orders" element={<BuyerOrderHistory />} />
        <Route path="/tracking/:orderId" element={<OrderTracking />} />
        <Route path="/tracking" element={<Navigate to="/buyer-orders" replace />} />
        <Route path="/logistics" element={<TransporterLoadBoard />} />
        <Route path="/register" element={<Auth />} />
        <Route path="/reviews" element={<RatingsReviews />} />
        <Route path="/ussd" element={<USSDSimulator />} />
        <Route path="/auth" element={<Auth />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App