import React, { useState, useEffect } from 'react';
import Home from './pages/Home';
import AuctionPage from './pages/AuctionPage';

function App() {
  const [status, setStatus] = useState('Chargement...');
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedAuctionId, setSelectedAuctionId] = useState(null);

  useEffect(() => {
    fetch('/backend/index.php?action=status')
      .then(res => res.json())
      .then(data => setStatus(data.message || 'Connecté au backend'))
      .catch(err => setStatus('Connexion backend en attente...'));
  }, []);

  const navigateToAuction = (id) => {
    setSelectedAuctionId(id);
    setCurrentPage('auction');
    window.scrollTo(0, 0);
  };

  const navigateToHome = () => {
    setCurrentPage('home');
    window.scrollTo(0, 0);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-logo" onClick={navigateToHome}>
          ⚓ Mercato Nova
        </h1>
        <p className="app-subtitle">Le magasinage en ligne de notre époque - Spécialiste Voile Légère</p>
        <div style={{ marginTop: '10px' }}>
          <span style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '15px', background: 'rgba(255,255,255,0.2)' }}>
            <span style={{ color: status.includes('Erreur') || status.includes('attente') ? '#ffccbc' : '#b9f6ca', marginRight: '5px' }}>●</span>
            {status}
          </span>
        </div>
      </header>
      
      <main className="main-content">
        {currentPage === 'home' ? (
          <Home onNavigateToAuction={navigateToAuction} />
        ) : (
          <AuctionPage auctionId={selectedAuctionId} onBack={navigateToHome} />
        )}
      </main>

      <footer className="app-footer">
        <p style={{ margin: 0 }}>&copy; 2026 Mercato Nova - Passion Voile & Nautisme</p>
        <p style={{ fontSize: '0.8rem', marginTop: '10px', opacity: 0.7 }}>Projet Web Dynamique - ING2 - ECE</p>
      </footer>
    </div>
  );
}

export default App;
