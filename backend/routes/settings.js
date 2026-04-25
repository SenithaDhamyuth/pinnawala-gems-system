import express from 'express';
import { collections } from '../config/db.js';

const router = express.Router();

const DEFAULT_RULES = [
    'All bidders must be registered and verified before participating in any auction.',
    'Bids are legally binding. Once placed, a bid cannot be retracted.',
    'Each bid must be higher than the current highest bid by a minimum increment of LKR 1,500,000.',
    'Auctions close at the specified end time. Last-minute bids do not extend the auction.',
    'Winning bidders will be contacted within 24 hours of auction closure.',
    'Full payment must be received within 7 business days of winning the auction.',
    'All gemstones are sold with certificates of authenticity and appropriate documentation.',
    'Buyers are responsible for applicable taxes and shipping costs.',
    'Returns are not accepted unless the item significantly differs from its description.',
    'Physical inspection appointments can be arranged during the auction period by contacting our team.'
];

async function getOrCreateSettings() {
    let settings = await collections.settings.findOne({});
    if (!settings) {
        const data = { auctionRules: DEFAULT_RULES };
        const result = await collections.settings.insertOne(data);
        settings = await collections.settings.findOne({ _id: result.insertedId });
    }
    
    settings.id = settings._id.toString();
    delete settings._id;
    return settings;
}

router.get('/', async (req, res) => {
    try {
        const settings = await getOrCreateSettings();
        res.json(settings);
    } catch (e) {
        res.status(500).json({ detail: "Server Error" });
    }
});

router.put('/', async (req, res) => {
    try {
        let settings = await collections.settings.findOne({});
        const updateData = { auctionRules: req.body.auctionRules || [] };
        
        if (!settings) {
            const result = await collections.settings.insertOne(updateData);
            settings = await collections.settings.findOne({ _id: result.insertedId });
        } else {
            await collections.settings.updateOne(
                { _id: settings._id },
                { $set: updateData }
            );
            settings = await collections.settings.findOne({ _id: settings._id });
        }
        
        settings.id = settings._id.toString();
        delete settings._id;
        res.json(settings);
    } catch (e) {
        res.status(500).json({ detail: "Server Error" });
    }
});

export default router;
