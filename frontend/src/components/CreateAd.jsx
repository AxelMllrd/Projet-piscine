import React, { useState } from 'react';

/**
 * Composant CreateAd - Tunnel de mise en vente type Leboncoin/Vinted
 */
const CreateAd = ({ userId, onAdCreated }) => {
    const [formData, setFormData] = useState({
        titre: '',
        description: '',
        categorie: 'Wingfoil',
        etat: 'Neuf',
        type_vente: 'Achat immédiat',
        prix: ''
    });
    const [images, setImages] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setImages(files);

        // Générer des aperçus
        const filePreviews = files.map(file => URL.createObjectURL(file));
        setPreviews(filePreviews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validations
        if (formData.titre.length < 5) {
            alert("Le titre doit faire au moins 5 caractères.");
            return;
        }
        if (parseFloat(formData.prix) <= 0) {
            alert("Le prix doit être supérieur à 0.");
            return;
        }
        if (images.length === 0) {
            alert("Veuillez ajouter au moins une photo.");
            return;
        }

        setLoading(true);

        const data = new FormData();
        data.append('user_id', userId);
        data.append('titre', formData.titre);
        data.append('description', formData.description);
        data.append('categorie', formData.categorie);
        data.append('etat', formData.etat);
        data.append('type_vente', formData.type_vente);
        data.append('prix', formData.prix);

        // Ajout multiple des fichiers
        images.forEach((image) => {
            data.append('images[]', image);
        });

        try {
            const response = await fetch('http://localhost/backend/create_ad.php', {
                method: 'POST',
                body: data // FormData définit automatiquement le header multipart/form-data
            });

            const result = await response.json();

            if (response.ok) {
                alert("Votre annonce a été publiée avec succès !");
                if (onAdCreated) onAdCreated(result.ad_id);
            } else {
                alert(result.message || "Une erreur est survenue.");
            }
        } catch (error) {
            console.error("Erreur publication:", error);
            alert("Impossible de contacter le serveur.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-ad-container" style={styles.container}>
            <h1 style={styles.title}>Vendre un article</h1>
            
            <form onSubmit={handleSubmit} style={styles.form}>
                {/* Section 1 : Photos */}
                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>1. Photos de l'article</h2>
                    <p style={styles.subtitle}>Ajoutez au moins une photo pour illustrer votre matériel.</p>
                    <div style={styles.photoUploadBox}>
                        <input 
                            type="file" 
                            multiple 
                            accept="image/*" 
                            onChange={handleFileChange}
                            style={styles.fileInput}
                            id="file-upload"
                        />
                        <label htmlFor="file-upload" style={styles.uploadLabel}>
                            <i className="fa-solid fa-camera" style={{fontSize: '2rem', marginBottom: '10px'}}></i>
                            <span>Ajouter des photos</span>
                        </label>
                    </div>
                    <div style={styles.previewsGrid}>
                        {previews.map((src, idx) => (
                            <img key={idx} src={src} alt="Aperçu" style={styles.previewImg} />
                        ))}
                    </div>
                </div>

                {/* Section 2 : Détails */}
                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>2. Détails de l'annonce</h2>
                    
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Titre de l'annonce</label>
                        <input 
                            type="text" 
                            name="titre" 
                            value={formData.titre} 
                            onChange={handleInputChange} 
                            placeholder="ex: Planche de Wingfoil 110L" 
                            style={styles.input}
                            required 
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Description</label>
                        <textarea 
                            name="description" 
                            value={formData.description} 
                            onChange={handleInputChange} 
                            placeholder="Décrivez l'état, l'usure, les accessoires inclus..." 
                            style={styles.textarea}
                            required 
                        />
                    </div>

                    <div style={styles.row}>
                        <div style={{...styles.inputGroup, flex: 1}}>
                            <label style={styles.label}>Catégorie</label>
                            <select name="categorie" value={formData.categorie} onChange={handleInputChange} style={styles.select}>
                                <option>Wingfoil</option>
                                <option>Kitesurf</option>
                                <option>Accessoire</option>
                                <option>Néoprène</option>
                                <option>Planche à voile</option>
                                <option>Pièce détachée</option>
                            </select>
                        </div>
                        <div style={{...styles.inputGroup, flex: 1}}>
                            <label style={styles.label}>État</label>
                            <select name="etat" value={formData.etat} onChange={handleInputChange} style={styles.select}>
                                <option>Neuf</option>
                                <option>Très bon état</option>
                                <option>Bon état</option>
                                <option>Satisfaisant</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Section 3 : Prix */}
                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>3. Type de vente et Prix</h2>
                    
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Mode de vente</label>
                        <div style={styles.radioGroup}>
                            {['Achat immédiat', 'Enchère', 'Négociation'].map(type => (
                                <label key={type} style={styles.radioLabel}>
                                    <input 
                                        type="radio" 
                                        name="type_vente" 
                                        value={type} 
                                        checked={formData.type_vente === type}
                                        onChange={handleInputChange}
                                    />
                                    <span style={{marginLeft: '8px'}}>{type}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Prix de vente</label>
                        <div style={styles.priceInputWrapper}>
                            <input 
                                type="number" 
                                name="prix" 
                                value={formData.prix} 
                                onChange={handleInputChange} 
                                style={styles.priceInput}
                                placeholder="0.00"
                                required 
                            />
                            <span style={styles.currency}>€</span>
                        </div>
                    </div>
                </div>

                <button type="submit" style={styles.submitBtn} disabled={loading}>
                    {loading ? "Publication en cours..." : "Publier l'annonce"}
                </button>
            </form>
        </div>
    );
};

const styles = {
    container: { maxWidth: '800px', margin: '40px auto', padding: '0 20px', fontFamily: 'Segoe UI, sans-serif' },
    title: { color: '#004a7c', marginBottom: '30px', textAlign: 'center' },
    form: { display: 'flex', flexDirection: 'column', gap: '25px' },
    section: { background: 'white', padding: '30px', borderRadius: '12px', border: '1px solid #e0e0e0', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' },
    sectionTitle: { fontSize: '1.2rem', color: '#333', marginBottom: '15px', borderBottom: '2px solid #f0f2f5', paddingBottom: '10px' },
    subtitle: { color: '#666', fontSize: '0.9rem', marginBottom: '20px' },
    photoUploadBox: { border: '2px dashed #0074b7', borderRadius: '8px', height: '150px', display: 'flex', alignItems: 'center', justifyCenter: 'center', position: 'relative', cursor: 'pointer', background: '#f8fbff' },
    fileInput: { position: 'absolute', width: '100%', height: '100%', opacity: 0, cursor: 'pointer' },
    uploadLabel: { display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#0074b7', fontWeight: 'bold' },
    previewsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px', marginTop: '20px' },
    previewImg: { width: '100%', height: '100px', objectFit: 'cover', borderRadius: '6px' },
    inputGroup: { marginBottom: '20px' },
    label: { display: 'block', marginBottom: '8px', fontWeight: '600', color: '#444' },
    input: { width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' },
    textarea: { width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', height: '120px', resize: 'vertical', boxSizing: 'border-box' },
    row: { display: 'flex', gap: '20px' },
    select: { width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', background: 'white' },
    radioGroup: { display: 'flex', gap: '20px', marginTop: '10px' },
    radioLabel: { display: 'flex', alignItems: 'center', cursor: 'pointer' },
    priceInputWrapper: { position: 'relative', maxWidth: '200px' },
    priceInput: { width: '100%', padding: '12px 40px 12px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '1.2rem', fontWeight: 'bold' },
    currency: { position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', fontWeight: 'bold', color: '#333' },
    submitBtn: { background: '#0074b7', color: 'white', padding: '18px', borderRadius: '8px', border: 'none', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' }
};

export default CreateAd;
