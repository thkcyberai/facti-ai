import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import NewsletterPage from './pages/NewsletterPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import BetaLoginPage from './pages/BetaLoginPage';
import DashboardPage from './pages/DashboardPage';
import UnifiedKYCPage from './pages/UnifiedKYCPage';
import AboutPage from './pages/AboutPage';
import UseCasesPage from './pages/UseCasesPage';
import ContactPage from './pages/ContactPage';
import TermsPage from './pages/legal/TermsPage';
import PrivacyPage from './pages/legal/PrivacyPage';
import NDAPage from './pages/legal/NDAPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/newsletter" element={<NewsletterPage />} />
        <Route path="/beta" element={<BetaLoginPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/use-cases" element={<UseCasesPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/unified" element={<UnifiedKYCPage />} />
        <Route path="/legal/terms" element={<TermsPage />} />
        <Route path="/legal/privacy" element={<PrivacyPage />} />
        <Route path="/legal/nda" element={<NDAPage />} />
      </Routes>
    </Router>
  );
}

export default App;
