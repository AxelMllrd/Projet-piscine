import React, { useState, useEffect } from 'react';

function Home({ onNavigateToAuction }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Récupération des articles depuis le backend
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
      <section style={{ marginBottom: '40px', background: '#f0f7ff', padding: '30px', borderRadius: '12px' }}>
        <h2 style={{ color: '#0056b3', marginTop: 0 }}>Matériel de Voile Légère</h2>
        <p>Retrouvez le meilleur équipement pour le Surf, Windsurf, Foil et Kitesurf. Neuf ou occasion.</p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '15px' }}>
          {['Surf', 'Windsurf', 'Windfoil', 'Wingfoil', 'Pumpfoil', 'Kitesurf', 'Kitefoil'].map(cat => (
            <span key={cat} style={{ background: 'white', padding: '5px 15px', borderRadius: '20px', fontSize: '0.9em', border: '1px solid #007bff', color: '#007bff', cursor: 'pointer' }}>
              {cat}
            </span>
          ))}
        </div>
      </section>

      <div className="item-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: '30px' 
      }}>
        {items.map(item => (
          <div key={item.id} className="item-card" style={{ 
            border: '1px solid #eee', 
            borderRadius: '12px', 
            overflow: 'hidden',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            transition: 'transform 0.2s',
            background: 'white'
          }}>
            <div style={{ 
              height: '200px', 
              backgroundImage: `url(${item.image_url})`, 
              backgroundSize: 'cover', 
              backgroundPosition: 'center',
              position: 'relative'
            }}>
              <span style={{ 
                position: 'absolute', 
                top: '10px', 
                right: '10px', 
                background: 'rgba(255,255,255,0.9)', 
                padding: '2px 10px', 
                borderRadius: '10px', 
                fontSize: '0.8em',
                fontWeight: 'bold'
              }}>
                {getConditionLabel(item.item_condition)}
              </span>
            </div>
            
            <div style={{ padding: '15px' }}>
              <span style={{ fontSize: '0.75em', textTransform: 'uppercase', color: '#888', fontWeight: 'bold' }}>
                {item.category}
              </span>
              <h3 style={{ margin: '5px 0 10px 0', fontSize: '1.1em' }}>{item.name}</h3>
              <p style={{ fontSize: '0.9em', color: '#666', height: '40px', overflow: 'hidden' }}>
                {item.description}
              </p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                <span style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#333' }}>
                  {item.price} €
                </span>
                <span style={{ 
                  fontSize: '0.7em', 
                  padding: '3px 8px', 
                  borderRadius: '4px', 
                  color: 'white', 
                  background: getBadgeColor(item.sale_type),
                  textTransform: 'uppercase'
                }}>
                  {item.sale_type === 'immediate' ? 'Achat Direct' : item.sale_type === 'auction' ? 'Enchère' : 'Négociation'}
                </span>
              </div>
              
              <button 
                onClick={() => handleActionClick(item)}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  marginTop: '15px', 
                  background: '#007bff', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                {item.sale_type === 'auction' ? 'Participer à l\'enchère' : 'Voir les détails'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
