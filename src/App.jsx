
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';

const RouteThemer = ({ children }) => {
  const location = useLocation();
  useEffect(() => {
    const lightRoutes = ["/", "/login", "/register"]; // leave these pages as-is
    const enableDark = !lightRoutes.includes(location.pathname);
    if (!enableDark) {
      // Strip theme classes on public pages; dashboard hook will manage for the rest
      document.documentElement.classList.remove("app-dark", "app-light", "dark");
      document.body.classList.remove("app-dark", "app-light", "dark");
    }
  }, [location.pathname]);
  return children;
};

const App = () => {
  return (
    <Router>
      <RouteThemer>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          
        </Routes>
      </RouteThemer>
    </Router>
  );
};

export default App;
