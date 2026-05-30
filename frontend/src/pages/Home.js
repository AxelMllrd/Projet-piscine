import React, { useState, useEffect } from 'react';

function Home({ onNavigateToAuction, searchQuery }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchQuery || '');
  const [category, setCategory] = useState('Toutes');

  // Met à jour la recherche locale si searchQuery (prop) change depuis le Header
  useEffect(() => {
    if (searchQuery !== undefined) {
      setSearch(searchQuery);
    }
  }, [searchQuery]);

  const fetchItems = () => {
    setLoading(true);
    const url = `/backend/index.php?action=items&q=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur lors de la récupération des articles:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchItems();
  }, [category, searchQuery]); // Re-fetch quand la catégorie ou la recherche change

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchItems();
  };

  const handleActionClick = (item) => {
    onNavigateToAuction(item.ID); // On utilise l'ID de la table ANNONCE
  };

  const getBadgeColor = (type) => {
    switch (type) {
      case 'Achat immédiat': return '#28a745';
      case 'Enchère': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const getConditionLabel = (condition) => {
    return condition; // Les labels sont déjà en français dans la table ANNONCE
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Chargement du matériel...</div>;

  return (
    <div className="home-container">
      <section className="hero-section">
        <h2 style={{ color: 'var(--primary-blue)', marginTop: 0 }}>Vagues, Vent & Passion</h2>
        <p>Le comptoir n°1 pour votre matériel de voile légère. Trouvez la perle rare ou vendez votre équipement à la communauté.</p>
        
        {/* Barre de recherche */}
        <form onSubmit={handleSearchSubmit} style={{ margin: '20px 0', display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            placeholder="Rechercher une aile, un foil, une planche..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autocomplete="off"
            style={{ 
              flex: 1, padding: '12px 20px', borderRadius: '25px', 
              border: '2px solid var(--secondary-blue)', outline: 'none' 
            }}
          />
          <button type="submit" className="btn-marine" style={{ width: 'auto', padding: '0 25px', borderRadius: '25px' }}>
            <i className="fa-solid fa-magnifying-glass"></i>
          </button>
        </form>

        {/* Filtres par catégorie */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '20px' }}>
          {['Toutes', 'Wingfoil', 'Kitesurf', 'Accessoire', 'Néoprène', 'Planche à voile', 'Pièce détachée'].map(cat => (
            <span 
              key={cat} 
              onClick={() => setCategory(cat)}
              style={{ 
                background: category === cat ? 'var(--secondary-blue)' : 'var(--white)', 
                padding: '8px 18px', 
                borderRadius: '25px', 
                fontSize: '0.85rem', 
                border: '2px solid var(--secondary-blue)', 
                color: category === cat ? 'var(--white)' : 'var(--secondary-blue)', 
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {cat}
            </span>
          ))}
        </div>
      </section>

      <div className="item-grid">
        {items.map(item => (
          <div key={item.ID} className="item-card" onClick={() => handleActionClick(item)} style={{cursor: 'pointer'}}>
            <div className="card-image-container" style={{ 
              backgroundImage: `url(${Array.isArray(item.Images) ? item.Images[0] : ''})`, 
              backgroundSize: 'cover', 
              backgroundPosition: 'center'
            }}>
              <span className="card-badge-condition">
                {getConditionLabel(item.Etat)}
              </span>
            </div>
            
            <div className="card-content">
              <span className="card-category">{item.Categorie}</span>
              <h3 className="card-title">{item.Titre}</h3>
              <p style={{ fontSize: '0.9rem', color: '#666', height: '40px', overflow: 'hidden', marginBottom: '15px' }}>
                {item.Description}
              </p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span className="card-price">{item.Prix} €</span>
                <span style={{ 
                  fontSize: '0.65rem', 
                  padding: '4px 10px', 
                  borderRadius: '4px', 
                  color: 'white', 
                  background: getBadgeColor(item.Type_de_vente),
                  fontWeight: 'bold',
                  textTransform: 'uppercase'
                }}>
                  {item.Type_de_vente}
                </span>
              </div>
              
              {item.Type_de_vente === 'Enchère' && (
                  <div style={{fontSize: '0.8rem', color: '#d35400', fontWeight: 'bold', marginBottom: '10px'}}>
                      <i className="fa-regular fa-clock"></i> Enchère en cours
                  </div>
              )}

              {item.Accepte_Nego === 1 && (
                  <div style={{fontSize: '0.8rem', color: '#0074b7', marginBottom: '10px'}}>
                      <i className="fa-solid fa-comments"></i> Négociation possible
                  </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
