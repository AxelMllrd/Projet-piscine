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
      setMessage({ text: 'Votre offre doit être supérieure à l\'enchère actuelle.', type: 'error' });
      return;
    }

    fetch(`/backend/index.php?action=place_bid&id=${auctionId}&amount=${amount}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setMessage({ text: data.error, type: 'error' });
        } else {
          setMessage({ text: data.message, type: 'success' });
          // Mise à jour locale pour la démo
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
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <button onClick={onBack} style={{ marginBottom: '20px', background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', fontSize: '1em' }}>
        ← Retour au catalogue
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        <div>
          <h2 style={{ marginBottom: '10px' }}>{auction.item_name}</h2>
          <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '12px', border: '1px solid #dee2e6' }}>
            <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '5px' }}>Enchère actuelle</p>
            <p style={{ fontSize: '2.5em', fontWeight: 'bold', color: '#28a745', margin: '0' }}>{auction.current_bid} €</p>
            
            <div style={{ marginTop: '20px', padding: '10px', background: '#fff3cd', borderRadius: '8px', border: '1px solid #ffeeba' }}>
              <p style={{ margin: 0, fontSize: '0.9em' }}>
                <strong>Temps restant :</strong> 2 jours 4 heures
              </p>
            </div>

            <form onSubmit={handlePlaceBid} style={{ marginTop: '30px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Placer une offre</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="number" 
                  step="0.01"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder={`Min. ${(auction.current_bid + 1).toFixed(2)}`}
                  style={{ flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #ced4da' }}
                />
                <button type="submit" style={{ padding: '12px 24px', background: '#007bff', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Enchérir
                </button>
              </div>
              {message.text && (
                <p style={{ marginTop: '10px', color: message.type === 'error' ? '#dc3545' : '#28a745', fontSize: '0.9em' }}>
                  {message.text}
                </p>
              )}
            </form>
          </div>
        </div>

        <div>
          <h3 style={{ marginBottom: '20px' }}>Historique des offres</h3>
          <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
                  <th style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>Utilisateur</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>Montant</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>Heure</th>
                </tr>
              </thead>
              <tbody>
                {auction.history.map((bid, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px', fontSize: '0.9em' }}>{bid.user}</td>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{bid.amount} €</td>
                    <td style={{ padding: '12px', fontSize: '0.8em', color: '#666' }}>{bid.time}</td>
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
