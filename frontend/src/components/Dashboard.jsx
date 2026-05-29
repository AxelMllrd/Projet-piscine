import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const { user } = useAuth();
    const [sales, setSales] = useState([]);
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('sales');

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const [salesRes, purchasesRes] = await Promise.all([
                    fetch(`/backend/index.php?action=user_sales&user_id=${user.id}`),
                    fetch(`/backend/index.php?action=user_purchases&user_id=${user.id}`)
                ]);
                
                const salesData = await salesRes.json();
                const purchasesData = await purchasesRes.json();
                
                setSales(Array.isArray(salesData) ? salesData : []);
                setPurchases(Array.isArray(purchasesData) ? purchasesData : []);
            } catch (error) {
                console.error("Erreur dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    if (!user) return <div style={{textAlign: 'center', padding: '50px'}}>Veuillez vous connecter.</div>;
    if (loading) return <div style={{textAlign: 'center', padding: '50px'}}>Chargement de votre bord de mer...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.avatar}>⛵</div>
                <div>
                    <h1 style={{margin: 0}}>{user.username}</h1>
                    <p style={{margin: '5px 0', opacity: 0.8}}>Tableau de Bord Mercato Nova</p>
                </div>
            </div>

            <div style={styles.tabs}>
                <button 
                    style={{...styles.tab, borderBottom: activeTab === 'sales' ? '3px solid #0074b7' : 'none'}}
                    onClick={() => setActiveTab('sales')}
                >
                    Mes Ventes ({sales.length})
                </button>
                <button 
                    style={{...styles.tab, borderBottom: activeTab === 'purchases' ? '3px solid #0074b7' : 'none'}}
                    onClick={() => setActiveTab('purchases')}
                >
                    Mes Achats ({purchases.length})
                </button>
            </div>

            <div style={styles.content}>
                {activeTab === 'sales' ? (
                    sales.length === 0 ? (
                        <p style={styles.empty}>Vous n'avez pas encore mis d'article en vente.</p>
                    ) : (
                        <div style={styles.grid}>
                            {sales.map(ad => (
                                <div key={ad.ID} style={styles.card}>
                                    <img src={ad.Images?.[0]} alt={ad.Titre} style={styles.cardImg} />
                                    <div style={styles.cardInfo}>
                                        <h3 style={styles.cardTitle}>{ad.Titre}</h3>
                                        <span style={styles.cardBadge}>{ad.Type_de_vente}</span>
                                        <p style={styles.cardPrice}>{ad.Prix} €</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    purchases.length === 0 ? (
                        <p style={styles.empty}>Vous n'avez pas encore effectué d'achat.</p>
                    ) : (
                        <div style={styles.grid}>
                            {purchases.map(p => (
                                <div key={p.id} style={styles.card}>
                                    <img src={p.Images?.[0]} alt={p.Titre} style={styles.cardImg} />
                                    <div style={styles.cardInfo}>
                                        <h3 style={styles.cardTitle}>{p.Titre}</h3>
                                        <p style={styles.cardPrice}>Payé : {p.amount} €</p>
                                        <span style={styles.cardTime}>Le {new Date(p.purchase_time).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

const styles = {
    container: { maxWidth: '1000px', margin: '0 auto', background: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
    header: { background: 'linear-gradient(135deg, #004a7c, #0074b7)', color: 'white', padding: '40px', display: 'flex', alignItems: 'center', gap: '25px' },
    avatar: { width: '80px', height: '80px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontSize: '2.5rem' },
    tabs: { display: 'flex', background: '#f8f9fa', borderBottom: '1px solid #eee' },
    tab: { flex: 1, padding: '15px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold', color: '#555', transition: 'all 0.2s' },
    content: { padding: '30px' },
    empty: { textAlign: 'center', color: '#888', padding: '40px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' },
    card: { border: '1px solid #eee', borderRadius: '10px', overflow: 'hidden', transition: 'transform 0.2s' },
    cardImg: { width: '100%', height: '140px', objectFit: 'cover' },
    cardInfo: { padding: '12px' },
    cardTitle: { margin: '0 0 8px 0', fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    cardBadge: { fontSize: '0.7rem', background: '#e1f5fe', color: '#0288d1', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' },
    cardPrice: { margin: '8px 0 0 0', fontWeight: 'bold', color: '#333' },
    cardTime: { fontSize: '0.75rem', color: '#999' }
};

export default Dashboard;
