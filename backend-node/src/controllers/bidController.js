const Bid = require('../models/Bid');
const Auction = require('../models/Auction');
const mongoose = require('mongoose');

function serializeBid(doc) {
    const bid = doc.toObject ? doc.toObject() : { ...doc };
    bid.id = bid._id.toString();
    delete bid._id;
    delete bid.__v;
    
    if (bid.tie_flag === undefined) {
        bid.tie_flag = false;
    }
    if (bid.timestamp_us === undefined) {
        const ts = bid.timestamp;
        if (ts instanceof Date) {
            bid.timestamp_us = ts.getTime() * 1000;
        } else {
            bid.timestamp_us = 0;
        }
    }
    return bid;
}

const getTies = async (req, res) => {
    try {
        const docs = await Bid.find({
            auctionId: req.params.auction_id,
            tie_flag: true
        }).sort({ timestamp: -1 });
        res.json(docs.map(serializeBid));
    } catch (e) {
        console.error(e);
        res.status(500).json({ detail: "Server Error" });
    }
};

const getBids = async (req, res) => {
    try {
        const docs = await Bid.find({
            auctionId: req.params.auction_id
        }).sort({ timestamp: -1 });
        res.json(docs.map(serializeBid));
    } catch (e) {
        console.error(e);
        res.status(500).json({ detail: "Server Error" });
    }
};

const createBid = async (req, res) => {
    try {
        const bidData = req.body;
        
        if (!mongoose.Types.ObjectId.isValid(bidData.auctionId)) {
            return res.status(400).json({ detail: "Invalid auction ID format" });
        }
        
        const auctionDoc = await Auction.findById(bidData.auctionId);
        if (!auctionDoc) {
            return res.status(404).json({ detail: "Auction not found" });
        }
        
        const nowServer = new Date();
        const start = new Date(auctionDoc.startDate);
        const end = new Date(auctionDoc.endDate);
        
        if (!(start <= nowServer && nowServer <= end)) {
            return res.status(400).json({ detail: "Auction is not currently active" });
        }
        
        const timestamp_us = nowServer.getTime() * 1000;
        
        const currentBid = auctionDoc.currentBid || 0;
        const minBid = currentBid + 5000;
        if (bidData.amount < minBid) {
            return res.status(400).json({ detail: `Bid amount must be at least ${minBid}` });
        }
        
        const newBid = new Bid({
            ...bidData,
            timestamp: nowServer,
            timestamp_us: timestamp_us,
            tie_flag: false
        });
        await newBid.save();
        
        if (auctionDoc.currentBid <= bidData.amount) {
            auctionDoc.currentBid = bidData.amount;
            await auctionDoc.save();
        }
        
        const ties = await Bid.find({
            auctionId: bidData.auctionId,
            amount: bidData.amount,
            timestamp_us: timestamp_us,
            _id: { $ne: newBid._id }
        });
        
        if (ties.length > 0) {
            const allTiedIds = ties.map(t => t._id);
            allTiedIds.push(newBid._id);
            await Bid.updateMany(
                { _id: { $in: allTiedIds } },
                { $set: { tie_flag: true } }
            );
        }
        
        const created = await Bid.findById(newBid._id);
        res.json(serializeBid(created));
    } catch (e) {
        console.error(e);
        res.status(500).json({ detail: "Server Error" });
    }
};

const ensureIndexes = async (req, res) => {
    try {
        await Bid.syncIndexes();
        res.json({ message: "Indexes created mapped successfully logic via mongoose" });
    } catch (e) {
        console.error(e);

                res.status(500).json({ detail: "Server Error" });
        }
};

module.exports = {
    getBids,
    getTies,
    ensureIndexes,
    createBid,
};
