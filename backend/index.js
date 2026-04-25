import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';

// Import routers
import auctionsRouter from './routes/auctions.js';
import bidsRouter from './routes/bids.js';
import usersRouter from './routes/users.js';
import settingsRouter from './routes/settings.js';
import uploadsRouter from './routes/uploads.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000; // Python FastAPI usually runs on 8000 by default or 8000 in Vite config

// Middleware
app.use(cors({
    origin: [
        "http://localhost:5173", 
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174"
    ],
    credentials: true
}));
app.use(express.json());

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auctions', auctionsRouter);
app.use('/api/bids', bidsRouter);
app.use('/api/users', usersRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/upload', uploadsRouter);

app.get('/', (req, res) => {
    res.json({ message: "Bidding Management System Node.js API is running" });
});

// Connect to DB and start server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Node.js server listening on port ${PORT}`);
    });
});
