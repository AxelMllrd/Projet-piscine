import React, { useState, useEffect } from 'react';

function Home({ onNavigateToAuction }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/backend/index.php?action=items')
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur lors de la récupération des articles:", err);
        setLoading(false);
      });
  }, []);

  const handleActionClick = (item) => {
    if (item.sale_type === 'auction') {
      onNavigateToAuction(item.id);
    } else {
      alert(`Action pour ${item.name} (${item.sale_type}) bientôt disponible !`);
    }
  };

  const getBadgeColor = (type) => {
    switch (type) {
      case 'immediate': return '#28a745';
      case 'auction': return '#ffc107';
      case 'negotiation': return '#17a2b8';
      default: return '#6c757d';
    }
  };

  const getConditionLabel = (condition) => {
    return condition === 'new' ? 'Neuf' : 'Occasion';
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Chargement du matériel...</div>;

  return (
    <div className="home-container">
      <section className="hero-section">
        <h2 style={{ color: 'var(--primary-blue)', marginTop: 0 }}>Vagues, Vent & Passion</h2>
        <p>Le comptoir n°1 pour votre matériel de voile légère. Trouvez la perle rare ou vendez votre équipement à la communauté.</p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '20px' }}>
          {['Surf', 'Windsurf', 'Windfoil', 'Wingfoil', 'Pumpfoil', 'Kitesurf', 'Kitefoil'].map(cat => (
            <span key={cat} style={{ 
              background: 'var(--white)', 
              padding: '8px 18px', 
              borderRadius: '25px', 
              fontSize: '0.85rem', 
              border: '2px solid var(--secondary-blue)', 
              color: 'var(--secondary-blue)', 
              fontWeight: 'bold',
              cursor: 'pointer' 
            }}>
              {cat}
            </span>
          ))}
        </div>
      </section>

      <div className="item-grid">
        {items.map(item => (
          <div key={item.id} className="item-card">
            <div className="card-image-container" style={{ 
              backgroundImage: `url(${item.image_url})`, 
              backgroundSize: 'cover', 
              backgroundPosition: 'center'
            }}>
              <span className="card-badge-condition">
                {getConditionLabel(item.item_condition)}
              </span>
            </div>
            
            <div className="card-content">
              <span className="card-category">{item.category}</span>
              <h3 className="card-title">{item.name}</h3>
              <p style={{ fontSize: '0.9rem', color: '#666', height: '40px', overflow: 'hidden', marginBottom: '15px' }}>
                {item.description}
              </p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span className="card-price">{item.price} €</span>
                <span style={{ 
                  fontSize: '0.65rem', 
                  padding: '4px 10px', 
                  borderRadius: '4px', 
                  color: 'white', 
                  background: getBadgeColor(item.sale_type),
                  fontWeight: 'bold',
                  textTransform: 'uppercase'
                }}>
                  {item.sale_type === 'immediate' ? 'Achat Direct' : item.sale_type === 'auction' ? 'Enchère' : 'Négociation'}
                </span>
              </div>
              
              <button 
                onClick={() => handleActionClick(item)}
                className={`btn-marine ${item.sale_type === 'auction' ? 'btn-accent' : ''}`}
              >
                {item.sale_type === 'auction' ? '⚓ Enchérir' : 'Voir les détails'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
