const Auction = require('../models/Auction');
const mongoose = require('mongoose');

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
    const auction = doc.toObject ? doc.toObject() : { ...doc };
    auction.id = auction._id.toString();
    delete auction._id;
    delete auction.__v;
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

exports.getAuctions = async (req, res) => {
    try {
        const { status } = req.query;
        let docs = await Auction.find({});
        let auctions = docs.map(serializeAuction);
        
        if (status) {
            auctions = auctions.filter(a => a.status === status);
        }
        res.json(auctions);
    } catch (e) {
        console.error(e);
        res.status(500).json({ detail: "Server Error" });
    }
};

exports.getAuctionById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ detail: "Invalid auction ID format" });
        }
        
        const doc = await Auction.findById(req.params.id);
        if (!doc) {
            return res.status(404).json({ detail: "Auction not found" });
        }
        res.json(serializeAuction(doc));
    } catch (e) {
        console.error(e);
        res.status(500).json({ detail: "Server Error" });
    }
};

exports.createAuction = async (req, res) => {
    try {
        const data = { ...req.body };
        if (data.startDate) data.startDate = new Date(data.startDate);
        if (data.endDate) data.endDate = new Date(data.endDate);
        
        if (data.currentBid === undefined || data.currentBid === null) {
            data.currentBid = data.startingBid;
        }
        
        const newAuction = new Auction(data);
        await newAuction.save();
        res.json(serializeAuction(newAuction));
    } catch (e) {
        console.error(e);
        res.status(500).json({ detail: "Server Error" });
    }
};

exports.updateAuction = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ detail: "Invalid auction ID format" });
        }
        
        const doc = await Auction.findById(req.params.id);
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
        delete data.id; 
        
        Object.assign(doc, data);
        await doc.save();
        
        res.json(serializeAuction(doc));
    } catch (e) {
        console.error(e);
        res.status(500).json({ detail: "Server Error" });
    }
};

exports.deleteAuction = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ detail: "Invalid auction ID format" });
        }
        
        const doc = await Auction.findById(req.params.id);
        if (!doc) {
            return res.status(404).json({ detail: "Auction not found" });
        }
        
        const status = computeStatus(doc.startDate, doc.endDate);
        if (status !== "upcoming") {
            return res.status(400).json({ detail: "Can only delete upcoming auctions" });
        }
        
        await doc.deleteOne();
        res.json({ message: "Auction deleted successfully" });
    } catch (e) {
        console.error(e);
        res.status(500).json({ detail: "Server Error" });
    }
};
