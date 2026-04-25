import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017";
const DB_NAME = process.env.DB_NAME || "bidding_management";

let client;
let db;
let collections = {};

export async function connectDB() {
    try {
        client = new MongoClient(MONGO_URL);
        await client.connect();
        console.log("Connected successfully to MongoDB");
        db = client.db(DB_NAME);
        
        collections.auctions = db.collection("auctions");
        collections.bids = db.collection("bids");
        collections.users = db.collection("users");
        collections.settings = db.collection("settings");
        
        return { client, db, collections };
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
}

export { client, db, collections };
