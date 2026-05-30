import React, { useState, useEffect } from 'react';
import Home from './pages/Home';
import ProductDetail from './components/ProductDetail';
import Dashboard from './components/Dashboard';
import CreateAd from './components/CreateAd';
import Header from './components/Header';
import { useAuth } from './context/AuthContext';

function App() {
  const { user } = useAuth();
  const [status, setStatus] = useState('Chargement...');
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedAdId, setSelectedAdId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/backend/index.php?action=status')
      .then(res => res.json())
      .then(data => setStatus(data.message || 'Connecté au backend'))
      .catch(() => setStatus('Connexion backend en attente...'));
  }, []);

  const navigateToAd = (id) => {
    setSelectedAdId(id);
    setCurrentPage('detail');
    window.scrollTo(0, 0);
  };

  const navigateToHome = () => {
    setCurrentPage('home');
    window.scrollTo(0, 0);
  };

  const navigateToDashboard = () => {
    setCurrentPage('dashboard');
    window.scrollTo(0, 0);
  };

  const navigateToCreateAd = () => {
    setCurrentPage('create');
    window.scrollTo(0, 0);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage('home'); // Redirige vers l'accueil pour voir les résultats
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'home': return <Home onNavigateToAuction={navigateToAd} searchQuery={searchQuery} />;
      case 'detail': return <ProductDetail adId={selectedAdId} onBack={navigateToHome} />;
      case 'dashboard': return <Dashboard />;
      case 'create': return <CreateAd userId={user?.id} onAdCreated={navigateToDashboard} />;
      default: return <Home onNavigateToAuction={navigateToAd} />;
    }
  };

  return (
    <div className="app-container">
      <Header 
        status={status} 
        onNavigateHome={navigateToHome} 
        onNavigateDashboard={navigateToDashboard}
        onNavigateCreate={navigateToCreateAd}
        onSearch={handleSearch}
      />
      
      <main className="main-content">
        {renderContent()}
      </main>

      <footer className="app-footer">
        <p style={{ margin: 0 }}>&copy; 2026 Mercato Nova - Passion Voile & Nautisme</p>
        <p style={{ fontSize: '0.8rem', marginTop: '10px', opacity: 0.7 }}>Projet Web Dynamique - ING2 - ECE</p>
      </footer>
    </div>
  );
}

export default App;
