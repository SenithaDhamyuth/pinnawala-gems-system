import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";

import InventoryRoutes from "./inventory/routes/InventoryRoutes";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/inventory/login" replace />} />
        <Route path="/inventory/*" element={<InventoryRoutes />} />
        <Route path="*" element={<Navigate to="/inventory/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
