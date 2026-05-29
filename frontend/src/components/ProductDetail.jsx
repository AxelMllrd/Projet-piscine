import React, { useState, useEffect } from 'react';
import AuctionTimer from './AuctionTimer';

/**
 * ProductDetail - Composant d'affichage d'une annonce
 */
const ProductDetail = ({ adId, onBack }) => {
    const [ad, setAd] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEnded, setIsEnded] = useState(false);

    useEffect(() => {
        setLoading(true);
        fetch(`/backend/index.php?action=item_detail&id=${adId}`)
          .then(res => res.json())
          .then(data => { 
              if (data.error) {
                  console.error(data.error);
              } else {
                  setAd(data);
              }
              setLoading(false); 
          })
          .catch(err => {
              console.error("Erreur fetch detail:", err);
              setLoading(false);
          });
    }, [adId]);

    if (loading) return <div style={{textAlign: 'center', padding: '50px'}}>Chargement des détails...</div>;
    if (!ad) return <div style={{textAlign: 'center', padding: '50px'}}>Annonce introuvable. <button onClick={onBack}>Retour</button></div>;

    const isAuction = ad.Type_de_vente === "Enchère";

    return (
        <div style={{maxWidth: '1200px', margin: '0 auto'}}>
            <button onClick={onBack} style={styles.backBtn}>
                <i className="fa-solid fa-arrow-left"></i> Retour aux annonces
            </button>
            
            <div style={styles.container}>
            <div style={styles.imageGallery}>
                <img src={ad.Images[0]} alt={ad.Titre} style={styles.mainImage} />
            </div>

            <div style={styles.details}>
                <h1 style={styles.title}>{ad.Titre}</h1>
                
                {isAuction && (
                    <AuctionTimer 
                        endDate={ad.Date_Fin_Enchere} 
                        onEnd={() => setIsEnded(true)} 
                    />
                )}

                <div style={styles.priceSection}>
                    <span style={styles.priceLabel}>
                        {isAuction ? "Prix actuel :" : "Prix :"}
                    </span>
                    <span style={styles.priceValue}>{ad.Prix} €</span>
                </div>

                <div style={styles.actionSection}>
                    {isAuction ? (
                        <button 
                            style={{...styles.btn, backgroundColor: isEnded ? '#ccc' : '#e67e22'}} 
                            disabled={isEnded}
                        >
                            {isEnded ? "Enchère terminée" : "Enchérir"}
                        </button>
                    ) : (
                        <div style={{display: 'flex', gap: '10px', flexDirection: 'column'}}>
                            <button style={{...styles.btn, backgroundColor: '#0074b7'}}>
                                Acheter maintenant
                            </button>
                            {ad.Accepte_Nego === 1 && (
                                <button style={{...styles.btn, backgroundColor: '#fff', color: '#0074b7', border: '2px solid #0074b7'}}>
                                    Faire une offre
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div style={styles.description}>
                    <h3>Description</h3>
                    <p>{ad.Description}</p>
                </div>
            </div>
            </div>
        </div>
    );
};

const styles = {
    backBtn: { 
        background: 'none', 
        border: 'none', 
        color: '#0074b7', 
        cursor: 'pointer', 
        marginBottom: '20px', 
        fontSize: '1rem', 
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    container: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', padding: '30px', background: 'white', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' },
    mainImage: { width: '100%', borderRadius: '10px', objectFit: 'cover' },
    title: { color: '#004a7c', fontSize: '2rem', marginBottom: '20px' },
    priceSection: { marginBottom: '25px', display: 'flex', alignItems: 'baseline', gap: '10px' },
    priceLabel: { color: '#666', fontSize: '1.1rem' },
    priceValue: { fontSize: '2.5rem', fontWeight: 'bold', color: '#333' },
    btn: { width: '100%', padding: '15px', borderRadius: '8px', border: 'none', color: 'white', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' },
    description: { marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }
};

export default ProductDetail;
