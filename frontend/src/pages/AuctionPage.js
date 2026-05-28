import React, { useState, useEffect } from 'react';

function AuctionPage({ auctionId, onBack }) {
  const [auction, setAuction] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/backend/index.php?action=auction_details&id=${auctionId}`)
      .then(res => res.json())
      .then(data => {
        setAuction(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [auctionId]);

  const handlePlaceBid = (e) => {
    e.preventDefault();
    const amount = parseFloat(bidAmount);
    
    if (isNaN(amount) || amount <= auction.current_bid) {
      setMessage({ text: '⚓ Votre offre doit être supérieure à l\'enchère actuelle.', type: 'error' });
      return;
    }

    fetch(`/backend/index.php?action=place_bid&id=${auctionId}&amount=${amount}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setMessage({ text: data.error, type: 'error' });
        } else {
          setMessage({ text: `⚓ ${data.message}`, type: 'success' });
          setAuction({
            ...auction,
            current_bid: amount,
            history: [{ user: 'Moi (Démo)', amount: amount, time: new Date().toLocaleString() }, ...auction.history]
          });
          setBidAmount('');
        }
      });
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Chargement de l'enchère...</div>;
  if (!auction) return <div style={{ textAlign: 'center', padding: '50px' }}>Enchère introuvable.</div>;

  return (
    <div className="auction-page">
      <button onClick={onBack} style={{ 
        marginBottom: '20px', 
        background: 'none', 
        border: 'none', 
        color: 'var(--secondary-blue)', 
        cursor: 'pointer', 
        fontSize: '1rem',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: '5px'
      }}>
        ⚓ Retour au catalogue
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px' }}>
        <div style={{ background: 'var(--white)', padding: '30px', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
          <h2 style={{ color: 'var(--primary-blue)', marginBottom: '10px' }}>{auction.item_name}</h2>
          <div style={{ background: 'var(--light-blue)', padding: '25px', borderRadius: '12px', border: '2px solid var(--secondary-blue)' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--primary-blue)', marginBottom: '5px', fontWeight: 'bold', textTransform: 'uppercase' }}>Enchère actuelle</p>
            <p style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--primary-blue)', margin: '0' }}>{auction.current_bid} €</p>
            
            <div style={{ marginTop: '20px', padding: '12px', background: 'var(--sand)', borderRadius: '8px', border: '1px solid #d4c1b0', color: 'var(--primary-blue)' }}>
              <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 'bold' }}>
                ⏱️ Temps restant : 2 jours 4 heures
              </p>
            </div>

            <form onSubmit={handlePlaceBid} style={{ marginTop: '30px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: 'var(--primary-blue)' }}>Placer une offre (en €)</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="number" 
                  step="0.01"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder={`Min. ${(auction.current_bid + 1).toFixed(2)}`}
                  style={{ flex: 1, padding: '15px', borderRadius: '8px', border: '2px solid #ced4da', fontSize: '1.1rem' }}
                />
                <button type="submit" className="btn-marine btn-accent" style={{ width: 'auto', padding: '0 30px' }}>
                  Enchérir
                </button>
              </div>
              {message.text && (
                <p style={{ 
                  marginTop: '15px', 
                  padding: '10px', 
                  borderRadius: '6px',
                  background: message.type === 'error' ? '#ffebee' : '#e8f5e9',
                  color: message.type === 'error' ? var('--error') : var('--success'), 
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  border: `1px solid ${message.type === 'error' ? '#ffcdd2' : '#c8e6c9'}`
                }}>
                  {message.text}
                </p>
              )}
            </form>
          </div>
        </div>

        <div style={{ background: 'var(--white)', padding: '30px', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
          <h3 style={{ color: 'var(--primary-blue)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            📜 Historique des offres
          </h3>
          <div style={{ maxHeight: '450px', overflowY: 'auto', borderRadius: '8px', border: '1px solid #eee' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--light-blue)', textAlign: 'left' }}>
                  <th style={{ padding: '15px', color: 'var(--primary-blue)', fontSize: '0.9rem' }}>Utilisateur</th>
                  <th style={{ padding: '15px', color: 'var(--primary-blue)', fontSize: '0.9rem' }}>Montant</th>
                  <th style={{ padding: '15px', color: 'var(--primary-blue)', fontSize: '0.9rem' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {auction.history.map((bid, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #f0f0f0', background: index === 0 ? '#fffde7' : 'transparent' }}>
                    <td style={{ padding: '15px', fontSize: '0.95rem' }}>{index === 0 ? '👑 ' : ''}{bid.user}</td>
                    <td style={{ padding: '15px', fontWeight: 'bold', color: 'var(--primary-blue)' }}>{bid.amount} €</td>
                    <td style={{ padding: '15px', fontSize: '0.8rem', color: '#888' }}>{bid.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuctionPage;
