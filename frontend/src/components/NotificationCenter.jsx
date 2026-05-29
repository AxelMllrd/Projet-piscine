import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * NotificationCenter.jsx - Gestionnaire de notifications centralisé
 */
const NotificationCenter = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fonction pour formater la date de manière relative en JavaScript
    const formatRelativeTime = (dateString) => {
        const now = new Date();
        const past = new Date(dateString);
        const diffInSeconds = Math.floor((now - past) / 1000);

        if (diffInSeconds < 60) return "À l'instant";
        
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `Il y a ${diffInHours} h`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays === 1) return "Hier";
        if (diffInDays < 7) return `Il y a ${diffInDays} jours`;

        // Format standard pour les dates plus anciennes
        return past.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    };

    const fetchNotifications = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const response = await fetch(`/backend/get_notifications.php?user_id=${user.id}`, {
                headers: {
                    'Authorization': `Bearer ${user.id}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setNotifications(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des notifications", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen, user]);

    const markAsRead = async (id) => {
        try {
            const response = await fetch('/backend/mark_as_read.php', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.id}`
                },
                body: JSON.stringify({ notification_id: id })
            });
            if (response.ok) {
                setNotifications(notifications.map(n => 
                    n.ID === id ? { ...n, Est_Lu: 1 } : n
                ));
            }
        } catch (error) {
            console.error("Erreur markAsRead", error);
        }
    };

    const deleteNotification = async (e, id) => {
        e.stopPropagation(); // Éviter de déclencher markAsRead
        try {
            const response = await fetch('/backend/delete_notification.php', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.id}`
                },
                body: JSON.stringify({ notification_id: id })
            });
            if (response.ok) {
                setNotifications(notifications.filter(n => n.ID !== id));
            }
        } catch (error) {
            console.error("Erreur deleteNotification", error);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={styles.dropdown}>
            <div style={styles.header}>
                <h3 style={{ margin: 0, fontSize: '1rem' }}>Notifications</h3>
                <button onClick={onClose} style={styles.closeBtn}>×</button>
            </div>
            <div style={styles.list}>
                {loading ? (
                    <p style={styles.empty}>Chargement...</p>
                ) : notifications.length === 0 ? (
                    <p style={styles.empty}>Aucune notification</p>
                ) : (
                    notifications.map(notif => (
                        <div 
                            key={notif.ID} 
                            style={{
                                ...styles.item,
                                backgroundColor: notif.Est_Lu ? 'white' : '#f0f7ff'
                            }}
                            onClick={() => !notif.Est_Lu && markAsRead(notif.ID)}
                        >
                            {!notif.Est_Lu && <span style={styles.unreadDot} />}
                            <div style={styles.content}>
                                <p style={styles.text}>{notif.Contenu}</p>
                                <span style={styles.time}>{formatRelativeTime(notif.Date_Creation)}</span>
                            </div>
                            <button 
                                onClick={(e) => deleteNotification(e, notif.ID)}
                                style={styles.deleteBtn}
                                title="Supprimer"
                            >
                                🗑️
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const styles = {
    dropdown: {
        position: 'absolute',
        top: '100%',
        right: '0',
        marginTop: '10px',
        width: '320px',
        maxHeight: '450px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        color: '#333'
    },
    header: {
        padding: '15px',
        borderBottom: '1px solid #eee',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#f8f9fa'
    },
    closeBtn: {
        border: 'none',
        background: 'none',
        fontSize: '1.5rem',
        cursor: 'pointer',
        color: '#999'
    },
    list: {
        overflowY: 'auto',
        flex: 1
    },
    item: {
        padding: '12px 15px',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background-color 0.2s'
    },
    unreadDot: {
        width: '10px',
        height: '10px',
        backgroundColor: '#0074b7',
        borderRadius: '50%',
        marginTop: '5px',
        flexShrink: 0
    },
    content: {
        flex: 1
    },
    text: {
        margin: '0 0 5px 0',
        fontSize: '0.9rem',
        lineHeight: '1.3'
    },
    time: {
        fontSize: '0.75rem',
        color: '#888'
    },
    deleteBtn: {
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        fontSize: '1rem',
        opacity: 0.6,
        padding: '5px'
    },
    empty: {
        textAlign: 'center',
        padding: '20px',
        color: '#888',
        fontSize: '0.9rem'
    }
};

export default NotificationCenter;
