import express from 'express';
import { ObjectId } from 'mongodb';
import { collections } from '../config/db.js';

const router = express.Router();

function computeStatus(startDate, endDate) {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (now < start) {
        return "upcoming";
    } else if (start <= now && now <= end) {
        return "active";
    } else {
        return "completed";
    }
}

function serializeAuction(doc) {
    const auction = { ...doc };
    auction.id = auction._id.toString();
    delete auction._id;
    auction.status = computeStatus(auction.startDate, auction.endDate);
    
    // Backward compatibility
    if (!auction.media) {
        const media = [];
        (auction.images || []).forEach(img => {
            media.push({ url: img, type: "image", isPinned: false });
        });
        (auction.videos || []).forEach(vid => {
            media.push({ url: vid, type: "video", isPinned: false });
        });
        auction.media = media;
    } else {
        auction.media = auction.media.map(m => ({
            ...m,
            isPinned: m.isPinned !== undefined ? m.isPinned : false
        }));
    }
    
    delete auction.images;
    delete auction.videos;
    
    return auction;
}

router.get('/', async (req, res) => {
    try {
        const status = req.query.status;
        const cursor = collections.auctions.find({});
        const docs = await cursor.toArray();
        let auctions = docs.map(serializeAuction);
        
        if (status) {
            auctions = auctions.filter(a => a.status === status);
        }
        res.json(auctions);
    } catch (e) {
        res.status(500).json({ detail: "Server Error" });
    }
});

router.get('/:id', async (req, res) => {
    try {
        let objId;
        try { objId = new ObjectId(req.params.id); } 
        catch (e) { return res.status(400).json({ detail: "Invalid auction ID format" }); }
        
        const doc = await collections.auctions.findOne({ _id: objId });
        if (!doc) {
            return res.status(404).json({ detail: "Auction not found" });
        }
        res.json(serializeAuction(doc));
    } catch (e) {
        res.status(500).json({ detail: "Server Error" });
    }
});

router.post('/', async (req, res) => {
    try {
        const data = { ...req.body };
        // Convert date strings to Date objects if needed
        if (data.startDate) data.startDate = new Date(data.startDate);
        if (data.endDate) data.endDate = new Date(data.endDate);
        
        if (data.currentBid === undefined || data.currentBid === null) {
            data.currentBid = data.startingBid;
        }
        
        const result = await collections.auctions.insertOne(data);
        const created = await collections.auctions.findOne({ _id: result.insertedId });
        res.json(serializeAuction(created));
    } catch (e) {
        res.status(500).json({ detail: "Server Error" });
    }
});

router.put('/:id', async (req, res) => {
    try {
        let objId;
        try { objId = new ObjectId(req.params.id); } 
        catch (e) { return res.status(400).json({ detail: "Invalid auction ID format" }); }
        
        const doc = await collections.auctions.findOne({ _id: objId });
        if (!doc) {
            return res.status(404).json({ detail: "Auction not found" });
        }
        
        const status = computeStatus(doc.startDate, doc.endDate);
        if (status !== "upcoming") {
            return res.status(400).json({ detail: "Cannot edit an auction that has already started or completed" });
        }
        
        const data = { ...req.body };
        if (data.startDate) data.startDate = new Date(data.startDate);
        if (data.endDate) data.endDate = new Date(data.endDate);
        delete data.id; // Ensure we don't try to save 'id' back
        
        await collections.auctions.updateOne({ _id: objId }, { $set: data });
        const updated = await collections.auctions.findOne({ _id: objId });
        res.json(serializeAuction(updated));
    } catch (e) {
        res.status(500).json({ detail: "Server Error" });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        let objId;
        try { objId = new ObjectId(req.params.id); } 
        catch (e) { return res.status(400).json({ detail: "Invalid auction ID format" }); }
        
        const doc = await collections.auctions.findOne({ _id: objId });
        if (!doc) {
            return res.status(404).json({ detail: "Auction not found" });
        }
        
        const status = computeStatus(doc.startDate, doc.endDate);
        if (status !== "upcoming") {
            return res.status(400).json({ detail: "Can only delete upcoming auctions" });
        }
        
        await collections.auctions.deleteOne({ _id: objId });
        res.json({ message: "Auction deleted successfully" });
    } catch (e) {
        res.status(500).json({ detail: "Server Error" });
    }
});

export default router;
