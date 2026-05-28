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
  };

  const navigateToHome = () => {
    setCurrentPage('home');
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: '#007bff', cursor: 'pointer' }} onClick={navigateToHome}>Mercato Nova</h1>
        <p>Le magasinage en ligne de notre époque - Spécialiste Voile Légère</p>
        <span style={{ fontSize: '0.8em', color: status.includes('Erreur') ? 'red' : 'green' }}>
          ● {status}
        </span>
      </header>
      
      <main>
        {currentPage === 'home' ? (
          <Home onNavigateToAuction={navigateToAuction} />
        ) : (
          <AuctionPage auctionId={selectedAuctionId} onBack={navigateToHome} />
        )}
      </main>

      <footer style={{ marginTop: '50px', borderTop: '1px solid #eee', paddingTop: '20px', textAlign: 'center', fontSize: '0.8em', color: '#666' }}>
        Projet Web Dynamique 2026 - ING2
      </footer>
    </div>
  );
}

export default App;
