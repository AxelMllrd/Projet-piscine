import React, { useState, useEffect } from 'react';

/**
 * Composant AuctionTimer - Affiche un compte à rebours dynamique
 * @param {string} endDate - Date de fin au format ISO/SQL
 * @param {function} onEnd - Callback quand l'enchère se termine
 */
const AuctionTimer = ({ endDate, onEnd }) => {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    function calculateTimeLeft() {
        const difference = +new Date(endDate) - +new Date();
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                jours: Math.floor(difference / (1000 * 60 * 60 * 24)),
                heures: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                secondes: Math.floor((difference / 1000) % 60),
                total: difference
            };
        } else {
            timeLeft = { total: 0 };
        }
        return timeLeft;
    }

    useEffect(() => {
        const timer = setInterval(() => {
            const newTime = calculateTimeLeft();
            setTimeLeft(newTime);
            
            if (newTime.total <= 0) {
                clearInterval(timer);
                if (onEnd) onEnd();
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [endDate]);

    if (timeLeft.total <= 0) {
        return (
            <div style={styles.timerEnded}>
                <i className="fa-solid fa-hourglass-end" style={{marginRight: '8px'}}></i>
                Enchère terminée
            </div>
        );
    }

    return (
        <div style={styles.timerActive}>
            <span style={styles.timerLabel}>Temps restant :</span>
            <span style={styles.timerValue}>
                {timeLeft.jours > 0 && `${timeLeft.jours}j `}
                {timeLeft.heures}h {timeLeft.minutes}m {timeLeft.secondes}s
            </span>
        </div>
    );
};

const styles = {
    timerActive: {
        background: '#fff4e5',
        color: '#d35400',
        padding: '10px 15px',
        borderRadius: '8px',
        border: '1px solid #fab1a0',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '15px',
        fontWeight: 'bold'
    },
    timerLabel: { fontSize: '0.85rem', textTransform: 'uppercase' },
    timerValue: { fontSize: '1.1rem', fontFamily: 'monospace' },
    timerEnded: {
        background: '#f2f2f2',
        color: '#666',
        padding: '10px 15px',
        borderRadius: '8px',
        marginBottom: '15px',
        fontWeight: 'bold',
        textAlign: 'center'
    }
};

export default AuctionTimer;
