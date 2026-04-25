import express from 'express';
import { ObjectId } from 'mongodb';
import { collections } from '../config/db.js';

const router = express.Router();

function serializeBid(doc) {
    const bid = { ...doc };
    bid.id = bid._id.toString();
    delete bid._id;
    
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

router.get('/ties/:auction_id', async (req, res) => {
    try {
        const cursor = collections.bids.find({
            auctionId: req.params.auction_id,
            tie_flag: true
        }).sort({ timestamp: -1 });
        const docs = await cursor.toArray();
        res.json(docs.map(serializeBid));
    } catch (e) {
        res.status(500).json({ detail: "Server Error" });
    }
});

router.get('/:auction_id', async (req, res) => {
    try {
        const cursor = collections.bids.find({
            auctionId: req.params.auction_id
        }).sort({ timestamp: -1 });
        const docs = await cursor.toArray();
        res.json(docs.map(serializeBid));
    } catch (e) {
        res.status(500).json({ detail: "Server Error" });
    }
});

router.post('/', async (req, res) => {
    try {
        const bid = req.body;
        
        let objId;
        try { objId = new ObjectId(bid.auctionId); } 
        catch (e) { return res.status(400).json({ detail: "Invalid auction ID format" }); }
        
        const auctionDoc = await collections.auctions.findOne({ _id: objId });
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
        if (bid.amount < minBid) {
            return res.status(400).json({ detail: `Bid amount must be at least ${minBid}` });
        }
        
        const bidData = {
            ...bid,
            timestamp: nowServer,
            timestamp_us: timestamp_us,
            tie_flag: false
        };
        
        const result = await collections.bids.insertOne(bidData);
        const newBidId = result.insertedId;
        
        await collections.auctions.updateOne(
            { _id: objId, currentBid: { $lte: bid.amount } },
            { $set: { currentBid: bid.amount } }
        );
        
        const tieCursor = collections.bids.find({
            auctionId: bid.auctionId,
            amount: bid.amount,
            timestamp_us: timestamp_us,
            _id: { $ne: newBidId }
        });
        const ties = await tieCursor.toArray();
        
        if (ties.length > 0) {
            const allTiedIds = ties.map(t => t._id);
            allTiedIds.push(newBidId);
            
            await collections.bids.updateMany(
                { _id: { $in: allTiedIds } },
                { $set: { tie_flag: true } }
            );
        }
        
        const created = await collections.bids.findOne({ _id: newBidId });
        res.json(serializeBid(created));
    } catch (e) {
        console.error(e);
        res.status(500).json({ detail: "Server Error" });
    }
});

router.post('/ensure-indexes', async (req, res) => {
    try {
        await collections.bids.createIndex(
            { auctionId: 1, amount: -1, timestamp_us: 1 },
            { name: "bid_auction_amount_ts" }
        );
        await collections.bids.createIndex(
            { auctionId: 1, tie_flag: 1 },
            { name: "bid_tie_flag" }
        );
        res.json({ message: "Indexes created successfully" });
    } catch (e) {
        res.status(500).json({ detail: "Server Error" });
    }
});

export default router;
