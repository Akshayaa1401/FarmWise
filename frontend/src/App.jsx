import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import FarmProfile from './pages/FarmProfile';
import Recommendations from './pages/Recommendations';
import CompareSeeds from './pages/CompareSeeds';
import FarmingGuidance from './pages/FarmingGuidance';
import SeedDetail from './pages/SeedDetail';
import FarmMemory from './pages/FarmMemory';
import Shops from './pages/Shops';
import MyBookings from './pages/MyBookings';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <p style={{ color: 'var(--color-forest-dark)', fontSize: '1.1rem', fontWeight: '600' }}>
          Verifying security token...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <FarmProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recommendations"
            element={
              <ProtectedRoute>
                <Recommendations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/compare-seeds"
            element={
              <ProtectedRoute>
                <CompareSeeds />
              </ProtectedRoute>
            }
          />
          <Route path="/farming-guidance" element={<FarmingGuidance />} />
          <Route path="/farm-resources" element={<Navigate to="/farming-guidance" replace />} />
          <Route path="/seed-varieties/:id" element={<SeedDetail />} />
          <Route path="/shops" element={<Shops />} />
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farm-memory"
            element={
              <ProtectedRoute>
                <FarmMemory />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}
