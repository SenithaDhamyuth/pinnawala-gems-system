const Setting = require('../models/Setting');

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
    let settings = await Setting.findOne({});
    if (!settings) {
        const newSettings = new Setting({ auctionRules: DEFAULT_RULES });
        await newSettings.save();
        settings = newSettings;
    }
    
    const out = settings.toObject ? settings.toObject() : { ...settings };
    out.id = out._id.toString();
    delete out._id;
    delete out.__v;
    return out;
}

exports.getSettings = async (req, res) => {
    try {
        const settings = await getOrCreateSettings();
        res.json(settings);
    } catch (e) {
        console.error(e);
        res.status(500).json({ detail: "Server Error" });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        let settings = await Setting.findOne({});
        const updateData = { auctionRules: req.body.auctionRules || [] };
        
        if (!settings) {
            settings = new Setting(updateData);
            await settings.save();
        } else {
            settings.auctionRules = updateData.auctionRules;
            await settings.save();
        }
        
        const out = settings.toObject ? settings.toObject() : { ...settings };
        out.id = out._id.toString();
        delete out._id;
        delete out.__v;
        res.json(out);
    } catch (e) {
        console.error(e);
        res.status(500).json({ detail: "Server Error" });
    }
};
