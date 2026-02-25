import React, { useState, useEffect } from 'react';
import { getGemstones, createOffer } from '../../services/api';

const Marketplace = () => {
    const [gemstones, setGemstones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Modal එක පාලනය කරන අලුත් States
    const [selectedGem, setSelectedGem] = useState(null);
    const [offerPrice, setOfferPrice] = useState('');

    useEffect(() => {
        const fetchGems = async () => {
            try {
                const data = await getGemstones();
                setGemstones(data);
                setLoading(false);
            } catch (err) {
                setError("Failed to fetch gemstones from the server.");
                setLoading(false);
            }
        };
        fetchGems();
    }, []);

    // බොත්තම එබුවම Modal එක ඕපන් කරන Function එක
    const handleOpenOffer = (gem) => {
        setSelectedGem(gem);
        setOfferPrice(gem.base_price); // Default ගාණ විදිහට Base Price එක පෙන්නනවා
    };

    // Offer එක යවන Function එක
    const submitOffer = async () => {
        // ගාණක් ටයිප් කරලා නැත්නම් හෝ බිංදුවට වඩා අඩු නම් නවත්වනවා
        if (!offerPrice || parseFloat(offerPrice) <= 0) {
            alert("Please enter a valid offer amount.");
            return;
        }

        // Database එක බලාපොරොත්තු වෙන විදිහට Data ටික (JSON) ලෑස්ති කරනවා
        const offerData = {
            gem_id: selectedGem._id,
            buyer_id: "buyer_123", // දැනට Login system එකක් නැති නිසා බොරු ID එකක් දානවා
            offer_amount: parseFloat(offerPrice),
            status: "Pending"
        };

        try {
            // API එක හරහා Backend එකට යවනවා
            await createOffer(offerData);
            alert(`Success! Your offer of LKR ${offerPrice} for ${selectedGem.name} has been sent to the seller.`);
            setSelectedGem(null); // වැඩේ හරි, Popup එක වහනවා
        } catch (err) {
            alert("Failed to submit the offer. Please check your connection and try again.");
            console.error(err);
        }
    };

    if (loading) return <div style={{ padding: '50px', textAlign: 'center', fontSize: '18px' }}>Loading Pinnawala Gems...</div>;
    if (error) return <div style={{ padding: '50px', textAlign: 'center', color: 'red' }}>{error}</div>;

    return (
        <div style={{ padding: '40px', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", backgroundColor: '#fdfdfd', position: 'relative' }}>
            
            <div style={{ marginBottom: '30px', borderBottom: '2px solid #e0e0e0', paddingBottom: '10px', display: 'inline-block' }}>
                <h2 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#333' }}>
                    Open For <span style={{ color: '#ff4d4f' }}>Negotiation</span>
                </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '30px' }}>
                {gemstones.map((gem) => (
                    <div key={gem._id} style={{ 
                        backgroundColor: '#fff', borderRadius: '16px', padding: '20px', 
                        textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                        border: '1px solid #f0f0f0'
                    }}>
                        <div style={{ backgroundColor: '#f8f9fa', borderRadius: '12px', padding: '15px', marginBottom: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '160px' }}>
<img 
    src={gem.image_url || "https://via.placeholder.com/150/00bcd4/FFFFFF?Text=No+Image"} 
    alt={gem.name} 
    style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }}
/>
                        </div>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#222', margin: '10px 0 5px 0' }}>{gem.name}</h3>
                        <p style={{ fontSize: '13px', color: '#666', margin: '0 0 5px 0' }}>Weight: {gem.weight_carats} Carats</p>
                        <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#333', margin: '5px 0 15px 0' }}>
                            Price: LKR {gem.base_price}
                        </p>
                        
                        {/* OnClick එක දැම්මා */}
                        <button 
                            onClick={() => handleOpenOffer(gem)}
                            style={{ backgroundColor: '#6b46c1', color: 'white', padding: '8px 25px', border: 'none', borderRadius: '50px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', boxShadow: '0 4px 10px rgba(107, 70, 193, 0.3)' }}
                        >
                            Send Offer
                        </button>
                    </div>
                ))}
            </div>

            {/* Negotiation Modal (Popup) එක */}
            {selectedGem && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
                    backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', 
                    justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: '#fff', padding: '30px', borderRadius: '16px', 
                        width: '350px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', textAlign: 'center'
                    }}>
                        <h3 style={{ margin: '0 0 15px 0' }}>Make an Offer</h3>
                        <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
                            {selectedGem.name} <br/> 
                            <strong>Listed Price: LKR {selectedGem.base_price}</strong>
                        </p>
                        
                        <input 
                            type="number" 
                            value={offerPrice}
                            onChange={(e) => setOfferPrice(e.target.value)}
                            style={{
                                width: '90%', padding: '10px', marginBottom: '20px', 
                                borderRadius: '8px', border: '1px solid #ccc', fontSize: '16px'
                            }}
                        />
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                            <button 
                                onClick={() => setSelectedGem(null)}
                                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ccc', backgroundColor: '#f9f9f9', cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={submitOffer}
                                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: '#6b46c1', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                                Submit Offer
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Marketplace;