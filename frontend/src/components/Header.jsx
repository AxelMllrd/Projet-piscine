import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import NotificationCenter from './NotificationCenter';

/**
 * Header.jsx - En-tête principal de l'application
 * Gère l'affichage de l'utilisateur connecté, la cloche de notifications
 * et le bouton de déconnexion.
 */
const Header = ({ status, onNavigateHome }) => {
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
        const response = await fetch(`http://localhost/backend/get_notifications.php?user_id=${user.id}`, {
          headers: {
            Authorization: `Bearer ${user.id}`
          }
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        const count = data.filter((notif) => !notif.Est_Lu).length;
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
    setShowNotifs(false);
    logout();
  };

  const toggleNotifications = () => {
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
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {user && (
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={toggleNotifications}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  position: 'relative',
                  padding: '5px'
                }}
                aria-label="Afficher les notifications"
              >
                🔔
                <span
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-6px',
                    minWidth: '18px',
                    height: '18px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    backgroundColor: '#e74c3c',
                    color: '#fff',
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    border: '2px solid #004a7c',
                    padding: unreadCount > 0 ? '0 5px' : '0'
                  }}
                >
                  {unreadCount > 0 ? unreadCount : ''}
                </span>
              </button>

              <NotificationCenter isOpen={showNotifs} onClose={() => setShowNotifs(false)} />
            </div>
          )}

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '15px', background: 'rgba(255,255,255,0.2)' }}>
              <span style={{ color: status.toLowerCase().includes('erreur') || status.toLowerCase().includes('attente') ? '#ffccbc' : '#b9f6ca', marginRight: '5px' }}>
                ●
              </span>
              {status}
            </span>
            {user && (
              <div style={{ marginTop: '5px', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: '0.8rem' }}>👤 {user.username}</span>
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.4)',
                    background: 'rgba(255,255,255,0.12)',
                    color: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
