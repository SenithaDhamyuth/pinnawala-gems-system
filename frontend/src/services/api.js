import axios from 'axios';

// අපේ FastAPI Backend එකේ Base URL එක
const API_URL = 'http://127.0.0.1:8000/api';

// 1. Database එකේ තියෙන ගල් ඔක්කොම අරන් එන Function එක (GET)
export const getGemstones = async () => {
    try {
        // axios හරහා backend එකට call එකක් යවනවා
        const response = await axios.get(`${API_URL}/gemstones/`);
        return response.data; 
    } catch (error) {
        console.error("Error fetching gemstones:", error);
        throw error; // Error එකක් ආවොත් UI එකට පාස් කරනවා
    }
};

// 2. අලුත් ගලක් Database එකට දාන Function එක (POST)
export const createGemstone = async (gemData) => {
    try {
        const response = await axios.post(`${API_URL}/gemstones/`, gemData);
        return response.data;
    } catch (error) {
        console.error("Error creating gemstone:", error);
        throw error;
    }
};

export const createOffer = async (offerData) => {
    try {
        const response = await axios.post(`${API_URL}/offers/`, offerData);
        return response.data;
    } catch (error) {
        console.error("Error creating offer:", error);
        throw error;
    }
};