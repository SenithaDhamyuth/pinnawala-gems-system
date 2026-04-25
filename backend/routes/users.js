import express from 'express';
import { ObjectId } from 'mongodb';
import { collections } from '../config/db.js';

const router = express.Router();

function serializeUser(doc) {
    const user = { ...doc };
    user.id = user._id.toString();
    delete user._id;
    return user;
}

router.get('/', async (req, res) => {
    try {
        const docs = await collections.users.find({}).toArray();
        res.json(docs.map(serializeUser));
    } catch (e) {
        res.status(500).json({ detail: "Server Error" });
    }
});

router.get('/:id', async (req, res) => {
    try {
        let objId;
        try { objId = new ObjectId(req.params.id); } 
        catch (e) { return res.status(400).json({ detail: "Invalid user ID format" }); }
        
        const doc = await collections.users.findOne({ _id: objId });
        if (!doc) {
            return res.status(404).json({ detail: "User not found" });
        }
        res.json(serializeUser(doc));
    } catch (e) {
        res.status(500).json({ detail: "Server Error" });
    }
});

export default router;
