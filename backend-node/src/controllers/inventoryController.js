const Inventory = require('../models/Inventory');

// CREATE inventory item (add to private stock)
exports.createStock = async (req, res) => {
  try {
    console.log('[createStock] ====== NEW REQUEST ======');
    console.log('[createStock] Request body:', req.body);
    console.log('[createStock] User:', { id: req.user.id, role: req.user.role });

    const { name, gem_type, color, weight_carats, origin, clarity, cut, treatment, notes, quantity } = req.body;

    // Validation
    if (!name || !gem_type || !color || !weight_carats) {
      console.log('[createStock] ERROR: Missing required fields');
      return res.status(400).json({ 
        message: 'Missing required fields: name, gem_type, color, weight_carats' 
      });
    }

    const parsedWeight = parseFloat(weight_carats);
    if (!Number.isFinite(parsedWeight) || parsedWeight <= 0) {
      console.log('[createStock] ERROR: Invalid weight');
      return res.status(400).json({ message: 'Weight must be greater than zero carats.' });
    }

    const inventoryData = {
      seller_id: req.user.id,
      name: name.trim(),
      gem_type: gem_type.trim(),
      color: color.trim(),
      weight_carats: parsedWeight,
      origin: origin?.trim() || '',
      clarity: clarity?.trim() || '',
      cut: cut?.trim() || '',
      treatment: treatment?.trim() || '',
      notes: notes?.trim() || '',
      quantity: parseInt(quantity) || 1,
      status: 'Available'
    };

    console.log('[createStock] Final data to save:', JSON.stringify(inventoryData, null, 2));

    const inventory = await Inventory.create(inventoryData);
    console.log('[createStock] Stock created successfully:', inventory._id);
    res.status(201).json(inventory);
  } catch (err) {
    console.error('[createStock] ERROR:', err);
    
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => ({ field: e.path, message: e.message }));
      console.error('[createStock] Validation errors:', errors);
      return res.status(400).json({ 
        message: `Validation Error: ${errors.map(e => `${e.field}: ${e.message}`).join(', ')}` 
      });
    }
    
    res.status(400).json({ message: err.message });
  }
};

// READ all inventory items for a seller
exports.getMyStock = async (req, res) => {
  try {
    console.log('[getMyStock] Request received at:', req.originalUrl);
    console.log('[getMyStock] User:', { id: req.user.id, role: req.user.role });

    let query = {};
    
    // Both sellers and admins see only their own stock in "My Inventory" view
    query.seller_id = req.user.id;
    // Admins can see all stock via a different endpoint if needed

    console.log('[getMyStock] Query:', query);

    const inventory = await Inventory.find(query).sort({ createdAt: -1 });
    console.log('[getMyStock] Stock items found:', inventory.length);
    res.json(inventory);
  } catch (err) {
    console.error('[getMyStock] ERROR:', err);
    res.status(500).json({ message: err.message });
  }
};

// READ all AVAILABLE inventory (for marketplace wizard)
exports.getAvailableStock = async (req, res) => {
  try {
    console.log('[getAvailableStock] Request received');
    console.log('[getAvailableStock] User:', { id: req.user.id, role: req.user.role });

    let query = { status: 'Available' };
    
    // Sellers see only their own available items
    if (req.user.role === 'seller') {
      query.seller_id = req.user.id;
    }

    const inventory = await Inventory.find(query).sort({ createdAt: -1 });
    console.log('[getAvailableStock] Available items found:', inventory.length);
    res.json(inventory);
  } catch (err) {
    console.error('[getAvailableStock] ERROR:', err);
    res.status(500).json({ message: err.message });
  }
};

// READ single inventory item
exports.getStockById = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Stock item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE inventory item
exports.updateStock = async (req, res) => {
  try {
    console.log('[updateStock] Updating item:', req.params.id);
    console.log('[updateStock] Update data:', req.body);

    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Stock item not found' });

    // Authorization: Only seller who created it or admin can update
    if (req.user.role !== 'admin' && item.seller_id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updated = await Inventory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    console.log('[updateStock] Stock updated successfully');
    res.json(updated);
  } catch (err) {
    console.error('[updateStock] ERROR:', err);
    res.status(400).json({ message: err.message });
  }
};

// DELETE inventory item
exports.deleteStock = async (req, res) => {
  try {
    console.log('[deleteStock] Deleting item:', req.params.id);

    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Stock item not found' });

    // Authorization
    if (req.user.role !== 'admin' && item.seller_id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Inventory.findByIdAndDelete(req.params.id);
    console.log('[deleteStock] Stock deleted successfully');
    res.json({ message: 'Stock item deleted' });
  } catch (err) {
    console.error('[deleteStock] ERROR:', err);
    res.status(500).json({ message: err.message });
  }
};

// MARK AS LISTED (when promoting to marketplace)
exports.markAsListed = async (req, res) => {
  try {
    console.log('[markAsListed] Marking item as listed:', req.params.id);

    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Stock item not found' });

    // Authorization
    if (req.user.role !== 'admin' && item.seller_id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updated = await Inventory.findByIdAndUpdate(
      req.params.id,
      { status: 'Listed' },
      { new: true }
    );
    
    console.log('[markAsListed] Stock marked as listed');
    res.json(updated);
  } catch (err) {
    console.error('[markAsListed] ERROR:', err);
    res.status(400).json({ message: err.message });
  }
};

// MARK AS SOLD
exports.markAsSold = async (req, res) => {
  try {
    console.log('[markAsSold] Marking item as sold:', req.params.id);

    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Stock item not found' });

    // Authorization
    if (req.user.role !== 'admin' && item.seller_id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updated = await Inventory.findByIdAndUpdate(
      req.params.id,
      { status: 'Sold' },
      { new: true }
    );
    
    console.log('[markAsSold] Stock marked as sold');
    res.json(updated);
  } catch (err) {
    console.error('[markAsSold] ERROR:', err);
    res.status(400).json({ message: err.message });
  }
};
