import "./App.css";
import { Route, Routes } from "react-router-dom";

// Pages
import LandingPage from "./pages/LandingPage";
import ProfilePage from "./pages/ProfilePage";
import CollateralManagementPage from "./pages/CollateralManagementPage";
import HealthFactor from "./components/HealthFactor/HealthFactor";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/profile/:address" element={<ProfilePage />} />
      <Route path="/collateral-management" element={<CollateralManagementPage/>} />
      <Route path="/healthFactor" element={<HealthFactor />} />
    </Routes>
  );
}

export default App;
