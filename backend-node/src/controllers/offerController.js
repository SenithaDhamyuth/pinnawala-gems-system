const Offer = require('../models/Offer');
const Gem   = require('../models/Gem');

// Buyer creates an offer
exports.createOffer = async (req, res) => {
  try {
    const { gem_id, offer_amount, message } = req.body;

    const gem = await Gem.findById(gem_id);
    if (!gem) return res.status(404).json({ message: 'Gem not found' });
    if (gem.status !== 'Active') return res.status(400).json({ message: 'Gem is not active' });

    // SECURITY: Prevent Self-Offers
    if (gem.seller_id.toString() === req.user.id) {
      return res.status(403).json({ message: 'You cannot place an offer on your own gemstone.' });
    }

    // BUSINESS LOGIC: Strict 50% Minimum Offer Validation
    const minAllowed = gem.base_price * 0.5;
    if (Number(offer_amount) < minAllowed) {
      return res.status(400).json({ message: `Offer amount must be at least 50% of the asking price (LKR ${minAllowed.toLocaleString()}).` });
    }

    const offer = await Offer.create({
      gem_id,
      buyer_id:    req.user.id,
      seller_id:   gem.seller_id,
      buyer_name:  req.user.full_name || 'Buyer',
      buyer_email: req.user.email,
      gem_name:    gem.name,
      offer_amount,
      message:     message || '',
      status:      'Pending',
    });

    // ── Real-time: Notify the seller ──────────────────────────────────────────
    const createNotification = req.app.get('createNotification');
    if (createNotification) {
      await createNotification({
        recipient: gem.seller_id,
        sender:    req.user.id,
        type:      'offer',
        content:   `New offer of Rs. ${offer_amount.toLocaleString()} received for ${gem.name}`,
        link:      '/seller-dashboard'
      });
    }

    res.status(201).json(offer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Seller sees all offers on their gems; Admin sees ALL offers platform-wide
exports.getSellerOffers = async (req, res) => {
  try {
    // Super-Admin Access: Admins bypass the seller_id filter and see everything
    const filter = req.user.role === 'admin' ? {} : { seller_id: req.user.id };
    const offers = await Offer.find(filter)
      .populate('gem_id', 'name image_url base_price')
      .populate('buyer_id', 'full_name email')
      .sort({ createdAt: -1 });
    res.json(offers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Buyer sees their own offers
exports.getBuyerOffers = async (req, res) => {
  try {
    const buyerId = req.user.id || req.user._id;
    const offers = await Offer.find({ buyer_id: buyerId })
      .populate('gem_id', 'name image_url base_price')
      .populate('seller_id', 'full_name email')
      .sort({ createdAt: -1 });
    res.json(offers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Seller responds: accept / reject / counter
exports.respondToOffer = async (req, res) => {
  try {
    const { status, counter_amount } = req.body;
    const allowed = ['Accepted', 'Rejected', 'Countered'];
    if (!allowed.includes(status))
      return res.status(400).json({ message: 'Invalid status' });

    const offer = await Offer.findById(req.params.id);
    if (!offer) return res.status(404).json({ message: 'Offer find error' });
     if (offer.seller_id.toString() !== req.user.id && req.user.role !== 'admin')
       return res.status(403).json({ message: 'Not authorized for this offer' });

    if (offer.status !== 'Pending') {
      return res.status(400).json({
        message: `This offer is already ${offer.status} and cannot be modified.`,
      });
    }

    offer.status = status;
    const io = req.app.get('io');

    if (status === 'Countered' && counter_amount) {
      offer.counter_amount = Number(counter_amount);
      // Notify buyer of counter
      const createNotification = req.app.get('createNotification');
      if (createNotification) {
        await createNotification({
          recipient: offer.buyer_id,
          sender:    req.user.id,
          type:      'offer',
          content:   `New counter-offer of Rs. ${counter_amount.toLocaleString()} for ${offer.gem_name}`,
          link:      '/buyer-dashboard'
        });
      }
    }

    if (status === 'Accepted') {
      const createNotification = req.app.get('createNotification');
      if (createNotification) {
        await createNotification({
          recipient: offer.buyer_id,
          sender:    req.user.id,
          type:      'offer',
          content:   `Your offer for ${offer.gem_name} has been Accepted!`,
          link:      '/buyer-dashboard'
        });
      }
    }

    await offer.save();
    res.json(offer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Admin views ALL offers in the system
exports.getAllOffers = async (req, res) => {
  try {
    const offers = await Offer.find()
      .populate('gem_id', 'name image_url base_price')
      .populate('buyer_id', 'full_name email')
      .populate('seller_id', 'full_name email')
      .sort({ createdAt: -1 });
    res.json(offers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Buyer accepts a seller's counter-offer; Admin can accept on behalf of any buyer
exports.acceptCounter = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) return res.status(404).json({ message: 'Offer not found' });
    // Super-Admin Access: Admins can accept any counter-offer
    if (offer.buyer_id.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });
    
    if (offer.status !== 'Countered')
      return res.status(400).json({ message: 'No counter-offer to accept' });

    offer.status = 'Accepted';
    offer.offer_amount = offer.counter_amount; // The counter price becomes the final price
    await offer.save();

    // Notify seller and buyer (via cart update)
    const createNotification = req.app.get('createNotification');
    if (createNotification) {
      // Notify Seller
      await createNotification({
        recipient: offer.seller_id,
        sender:    req.user.id,
        type:      'offer',
        content:   `Buyer accepted your counter-offer for ${offer.gem_name}`,
        link:      '/seller-dashboard'
      });
    }

    const io = req.app.get('io');
    if (io) {
      io.to(`user_${offer.buyer_id}`).emit('cart_update', {
        gem_id:           offer.gem_id.toString(),
        gem_name:         offer.gem_name,
        negotiated_price: offer.offer_amount,
        offer_id:         offer._id.toString(),
        status:           'Accepted',
      });
    }

    res.json({ message: 'Counter-offer accepted', offer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ BUYER PAYMENT: Process payment for an accepted offer
exports.processOfferPayment = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) return res.status(404).json({ message: 'Offer not found' });

    // ✅ BUYER ONLY: Verify this is the buyer making the payment
    if (offer.buyer_id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the buyer can process payment' });
    }

    // ✅ STATUS CHECK: Offer must be 'Accepted' to proceed to payment
    if (offer.status !== 'Accepted') {
      return res.status(400).json({ message: 'Offer must be accepted before payment' });
    }

    // ✅ UPDATE OFFER: Mark as 'Paid'
    offer.status = 'Paid';
    await offer.save();

    // ✅ UPDATE GEM: Mark as 'Sold' - Update both status and listing_status
    const gem = await Gem.findById(offer.gem_id);
    if (gem) {
      gem.status = 'Sold';
      gem.listing_status = 'Sold'; // Prevent gem from appearing in marketplace
      await gem.save();
    }

    // ✅ NOTIFY SELLER: About successful payment
    const createNotification = req.app.get('createNotification');
    if (createNotification) {
      await createNotification({
        recipient: offer.seller_id,
        sender:    req.user.id,
        type:      'offer',
        content:   `Payment received! Your ${offer.gem_name} has been sold for LKR ${offer.offer_amount.toLocaleString()}`,
        link:      '/seller-dashboard'
      });
    }

    res.json({ message: 'Payment processed successfully', offer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ ADMIN COUNTER OFFER: Send a counter offer to buyer
exports.sendCounterOffer = async (req, res) => {
  try {
    const { counter_price } = req.body;
    
    // Validate counter_price
    if (!counter_price || isNaN(counter_price) || Number(counter_price) <= 0) {
      return res.status(400).json({ message: 'Valid counter price is required' });
    }

    const offer = await Offer.findById(req.params.id);
    if (!offer) return res.status(404).json({ message: 'Offer not found' });

    // Only seller or admin can make counter offers
    if (offer.seller_id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to make counter offer' });
    }

    // Offer must be pending to make a counter offer
    if (offer.status !== 'Pending') {
      return res.status(400).json({ message: 'Can only make counter offers on pending offers' });
    }

    // Update offer with counter price
    offer.status = 'Countered';
    offer.offer_amount = Number(counter_price); // Update the offer amount to the new price
    await offer.save();

    // Notify buyer of counter offer
    const createNotification = req.app.get('createNotification');
    if (createNotification) {
      await createNotification({
        recipient: offer.buyer_id,
        sender:    req.user.id,
        type:      'offer',
        content:   `New counter-offer of Rs. ${Number(counter_price).toLocaleString()} for ${offer.gem_name}`,
        link:      '/buyer-dashboard'
      });
    }

    res.json({ message: 'Counter offer sent successfully', offer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ ADMIN ONLY: Delete an offer permanently
exports.deleteOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) return res.status(404).json({ message: 'Offer not found' });

    await Offer.findByIdAndDelete(req.params.id);
    res.json({ message: 'Offer deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};