import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import NotificationCenter from './NotificationCenter';

/**
 * Header.jsx - En-tête principal de l'application
 * Gère l'affichage de l'utilisateur connecté, la cloche de notifications
 * et le bouton de déconnexion.
 */
const Header = ({ status, onNavigateHome, onNavigateDashboard, onNavigateCreate }) => {
  const { user, logout } = useAuth();
  const [showNotifs, setShowNotifs] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setShowNotifs(false);
      setUnreadCount(0);
      return;
    }

    const fetchUnreadCount = async () => {
      try {
        const response = await fetch(`/backend/get_notifications.php?user_id=${user.id}`, {
          headers: {
            Authorization: `Bearer ${user.id}`
          }
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        const count = Array.isArray(data) ? data.filter((notif) => !notif.Est_Lu).length : 0;
        setUnreadCount(count);
      } catch (error) {
        console.error('Erreur count notifications', error);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    console.log("Déconnexion demandée");
    setShowNotifs(false);
    logout();
  };

  const toggleNotifications = () => {
    console.log("Toggle notifications, current state:", showNotifs);
    setShowNotifs((prev) => !prev);
  };

  return (
    <header className="app-header">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 className="app-logo" onClick={onNavigateHome} style={{ cursor: 'pointer' }}>
            ⚓ Mercato Nova
          </h1>
          <p className="app-subtitle">Le magasinage en ligne de notre époque - Spécialiste Voile Légère</p>
          {user && (
            <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
                <button onClick={onNavigateHome} style={styles.navLink}>Accueil</button>
                <button onClick={onNavigateDashboard} style={styles.navLink}>Mon Bord (Dashboard)</button>
                <button onClick={onNavigateCreate} style={{...styles.navLink, color: 'var(--accent-orange)'}}>
                    <i className="fa-solid fa-plus-circle"></i> Vendre un article
                </button>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {user && (
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="icon-btn"
                onClick={toggleNotifications}
                aria-label="Afficher les notifications"
              >
                <i className="far fa-bell"></i>
                {unreadCount > 0 && (
                  <span className="notif-badge">
                    {unreadCount}
                  </span>
                )}
              </button>

              <NotificationCenter isOpen={showNotifs} onClose={() => setShowNotifs(false)} />
            </div>
          )}

          <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '15px' }}>
            {user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="icon-btn" title={`Profil de ${user.username}`}>
                  <i className="far fa-user"></i>
                </div>
                <div style={{ textAlign: 'left', lineHeight: '1.2' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{user.username}</div>
                  <button
                    onClick={handleLogout}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-orange)',
                      padding: 0,
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      fontWeight: 'bold'
                    }}
                  >
                    Déconnexion
                  </button>
                </div>
              </div>
            )}
            
            <div style={{ 
              fontSize: '0.7rem', 
              padding: '6px 12px', 
              borderRadius: '20px', 
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                background: status.toLowerCase().includes('erreur') || status.toLowerCase().includes('attente') ? '#ffccbc' : '#b9f6ca'
              }}></span>
              {status}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

const styles = {
    navLink: {
        background: 'none',
        border: 'none',
        color: 'white',
        fontSize: '0.9rem',
        fontWeight: '600',
        cursor: 'pointer',
        padding: '5px 0',
        borderBottom: '2px solid transparent',
        transition: 'all 0.2s'
    }
};

export default Header;
