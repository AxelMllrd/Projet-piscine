import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Auth.jsx - Composant d'Authentification (Inscription & Connexion)
 * Pour la Marketplace Mercato Nova
 */
const Auth = () => {
    const { login } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [errors, setErrors] = useState({});
    const [successMessage, setMessage] = useState('');

    // États pour l'inscription
    const [registerData, setRegisterData] = useState({
        nom: '', prenom: '', username: '', email: '', 
        password: '', confirmPassword: '', role: 'acheteur', acceptCGU: false
    });

    // États pour la connexion
    const [loginData, setLoginData] = useState({
        identifier: '', password: ''
    });

    const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        let newErrors = {};

        // Validations côté client
        if (!registerData.nom) newErrors.nom = "Le nom est obligatoire";
        if (!registerData.prenom) newErrors.prenom = "Le prénom est obligatoire";
        if (!registerData.username) newErrors.username = "Le pseudo est obligatoire";
        if (!validateEmail(registerData.email)) newErrors.email = "Email invalide";
        if (registerData.password.length < 6) newErrors.password = "Min. 6 caractères";
        if (registerData.password !== registerData.confirmPassword) newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
        if (!registerData.acceptCGU) newErrors.cgu = "Vous devez accepter les CGU";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            const response = await fetch('http://localhost/backend/register.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(registerData)
            });
            const result = await response.json();
            if (response.ok) {
                setMessage("Inscription réussie ! Connectez-vous.");
                setIsLogin(true);
                setErrors({});
            } else {
                setErrors({ server: result.message });
            }
        } catch (err) {
            setErrors({ server: "Erreur de connexion au serveur" });
        }
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        if (!loginData.identifier || !loginData.password) {
            setErrors({ login: "Veuillez remplir tous les champs" });
            return;
        }

        try {
            const response = await fetch('http://localhost/backend/login.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData)
            });
            const result = await response.json();
            if (response.ok) {
                login(result.user);
                alert(`Bienvenue ${result.user.username} (${result.user.role})`);
            } else {
                setErrors({ login: result.message });
            }
        } catch (err) {
            setErrors({ login: "Erreur serveur" });
        }
    };

    const styles = {
        container: { maxWidth: '400px', margin: '50px auto', padding: '30px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' },
        input: { width: '100%', padding: '12px', margin: '10px 0', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' },
        button: { width: '100%', padding: '14px', background: '#0074b7', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
        error: { color: '#e74c3c', fontSize: '0.8rem', margin: '0' },
        toggle: { textAlign: 'center', marginTop: '20px', cursor: 'pointer', color: '#0074b7' }
    };

    return (
        <div style={styles.container}>
            <h2 style={{ textAlign: 'center', color: '#004a7c' }}>{isLogin ? 'Connexion' : 'Inscription'}</h2>
            {successMessage && <p style={{ color: '#2ecc71', textAlign: 'center' }}>{successMessage}</p>}

            {isLogin ? (
                <form onSubmit={handleLoginSubmit}>
                    <input 
                        style={styles.input} type="text" placeholder="Email ou Pseudo" 
                        onChange={e => setLoginData({...loginData, identifier: e.target.value})}
                    />
                    <input 
                        style={styles.input} type="password" placeholder="Mot de passe" 
                        onChange={e => setLoginData({...loginData, password: e.target.value})}
                    />
                    {errors.login && <p style={styles.error}>{errors.login}</p>}
                    <button style={styles.button} type="submit">Se connecter</button>
                </form>
            ) : (
                <form onSubmit={handleRegisterSubmit}>
                    <input style={styles.input} type="text" placeholder="Nom" onChange={e => setRegisterData({...registerData, nom: e.target.value})} />
                    {errors.nom && <p style={styles.error}>{errors.nom}</p>}
                    
                    <input style={styles.input} type="text" placeholder="Prénom" onChange={e => setRegisterData({...registerData, prenom: e.target.value})} />
                    {errors.prenom && <p style={styles.error}>{errors.prenom}</p>}

                    <input style={styles.input} type="text" placeholder="Pseudo" onChange={e => setRegisterData({...registerData, username: e.target.value})} />
                    {errors.username && <p style={styles.error}>{errors.username}</p>}

                    <input style={styles.input} type="email" placeholder="Email" onChange={e => setRegisterData({...registerData, email: e.target.value})} />
                    {errors.email && <p style={styles.error}>{errors.email}</p>}

                    <input style={styles.input} type="password" placeholder="Mot de passe" onChange={e => setRegisterData({...registerData, password: e.target.value})} />
                    {errors.password && <p style={styles.error}>{errors.password}</p>}

                    <input style={styles.input} type="password" placeholder="Confirmer mot de passe" onChange={e => setRegisterData({...registerData, confirmPassword: e.target.value})} />
                    {errors.confirmPassword && <p style={styles.error}>{errors.confirmPassword}</p>}

                    <div style={{ margin: '15px 0' }}>
                        <label style={{ marginRight: '20px' }}>
                            <input type="radio" name="role" value="acheteur" checked={registerData.role === 'acheteur'} onChange={e => setRegisterData({...registerData, role: e.target.value})} /> Acheteur
                        </label>
                        <label>
                            <input type="radio" name="role" value="vendeur" checked={registerData.role === 'vendeur'} onChange={e => setRegisterData({...registerData, role: e.target.value})} /> Vendeur
                        </label>
                    </div>

                    <label style={{ fontSize: '0.85rem' }}>
                        <input type="checkbox" onChange={e => setRegisterData({...registerData, acceptCGU: e.target.checked})} /> J'accepte les CGU
                    </label>
                    {errors.cgu && <p style={styles.error}>{errors.cgu}</p>}
                    {errors.server && <p style={styles.error}>{errors.server}</p>}

                    <button style={{ ...styles.button, marginTop: '20px' }} type="submit">Créer mon compte</button>
                </form>
            )}

            <p style={styles.toggle} onClick={() => { setIsLogin(!isLogin); setErrors({}); }}>
                {isLogin ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
            </p>
        </div>
    );
};

export default Auth;
