import { BrowserRouter, Routes, Route } from "react-router-dom"
import UserAuth       from "./pages/UserAuth"
import SellerRegister from "./pages/SellerRegister"
import AdminDashboard from "./pages/AdminDashboard"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"       element={<UserAuth />}       />
        <Route path="/seller" element={<SellerRegister />} />
        <Route path="/admin"  element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App