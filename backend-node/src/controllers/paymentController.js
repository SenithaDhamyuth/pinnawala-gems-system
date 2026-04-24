const Payment = require('../models/Payment');
const User    = require('../models/User');
const Gem     = require('../models/Gem');
const Offer   = require('../models/Offer');

// ── POST /api/payments ────────────────────────────────────────────────────────
// Buyer submits dummy payment for a gem.
// Behind the scenes: seller gets 85%, admin gets 15%.
exports.createPayment = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const { gem_id, card_last4, offer_id } = req.body;

    // Validate gem exists and is Active / Direct_Sale
    const gem = await Gem.findById(gem_id);
    if (!gem)              return res.status(404).json({ message: 'Gem not found.' });
    let totalAmount  = gem.base_price;
    
    // If checking out via an accepted offer, override the base price safely via backend verified ledger
    if (offer_id) {
       const offer = await Offer.findById(offer_id);
       if (!offer || offer.status !== 'Accepted' || offer.buyer_id.toString() !== buyerId) {
           return res.status(400).json({ message: 'Failed to verify secure offer acceptance.' });
       }
       
       // Ensure the gem isn't completely 'Sold' to someone else already
       if (gem.status === 'Sold' || gem.listing_status === 'Sold') {
           return res.status(400).json({ message: 'This gem has already been sold.' });
       }
       
       totalAmount = offer.offer_amount || offer.counter_amount;
       
       // Optionally mark the offer as officially Closed/Paid to avoid double-spends
       offer.status = 'Paid';
       await offer.save();
    } else {
       // Regular purchase check: must be active
       if (gem.status !== 'Active') {
           return res.status(400).json({ message: 'This gem is not available for purchase.' });
       }
    }

    // Create payment record
    const payment = await Payment.create({
      buyer_id:      buyerId,
      seller_id:     gem.seller_id,
      gem_id:        gem._id,
      gem_name:      gem.name,
      total_amount:  totalAmount,
      seller_amount: totalAmount, // 100% goes to seller
      commission:    0,
      card_last4:    card_last4 || '****',
      status:        'Completed',
    });

    // Credit seller wallet (100%)
    await User.findByIdAndUpdate(gem.seller_id, {
      $inc: { walletBalance: totalAmount },
    });

    // Mark gem as Sold (update both status and listing_status)
    await Gem.findByIdAndUpdate(gem._id, { 
      status: 'Sold',
      listing_status: 'Sold'
    });

    res.status(201).json({ message: 'Payment successful!', payment });
  } catch (err) {
    console.error('[Payment] Error:', err.message);
    res.status(500).json({ message: 'Payment processing failed.', error: err.message });
  }
};

// ── GET /api/payments/my ──────────────────────────────────────────────────────
// Returns the logged-in seller's wallet balance + transaction history.
exports.getMyWallet = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('walletBalance full_name');
    const history = await Payment.find({ seller_id: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('gem_id', 'name image_url');

    res.json({ walletBalance: user.walletBalance, history });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/payments/admin/revenue ──────────────────────────────────────────
// Returns the admin's cumulative revenue + all transactions.
exports.getAdminRevenue = async (req, res) => {
  try {
    const admin = await User.findById(req.user.id).select('adminRevenue');
    const transactions = await Payment.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('buyer_id',  'full_name email')
      .populate('seller_id', 'full_name shopName')
      .populate('gem_id',    'name');

    res.json({ adminRevenue: admin.adminRevenue, transactions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
