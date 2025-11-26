import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UnifiedKYCPage from './pages/UnifiedKYCPage';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('kycshield_token');
  return token ? children : <Navigate to="/" replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        } />
        <Route path="/unified" element={
          <PrivateRoute>
            <UnifiedKYCPage />
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
