const jwt = require('jsonwebtoken');

// 1. Secret Key එක ඔයාගේ teammate ගේ එකටම සමාන වෙන්න ඕනේ.
// .env file එකේ JWT_SECRET="pinnawala_secret_key_2026" කියලා තියෙන්න ඕනේ.
const SECRET_KEY = process.env.JWT_SECRET || "pinnawala_secret_key_2026";

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, not authorized' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // 2. මෙතන 'algorithms' කියන එක දාන එක හොඳයි මොකද Python පැත්තේ HS256 පාවිච්චි කරන නිසා.
    const decoded = jwt.verify(token, SECRET_KEY, { algorithms: ['HS256'] });
    
    // decoded එකේ දැන් { email, role, exp } තියෙනවා
    req.user = decoded; 
    next();
  } catch (err) {
    // ටෝකන් එක වැරදි නම් හෝ Expire වෙලා නම් මෙතනට එනවා
    return res.status(401).json({ message: 'Token invalid or expired' });
  }
};

const buyerOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'buyer') {
    return res.status(403).json({ message: 'Only buyers can do this' });
  }
  next();
};

const sellerOnly = (req, res, next) => {
  // Teammate ගේ Python code එකේ 'role' කියන key එකම පාවිච්චි කරපු නිසා මෙතන වෙනසක් නෑ.
  if (!req.user || req.user.role !== 'seller') {
    return res.status(403).json({ message: 'Only sellers can do this' });
  }
  next();
};

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

const sellerOrAdminOnly = (req, res, next) => {
  if (!req.user || (req.user.role !== 'seller' && req.user.role !== 'admin')) {
    return res.status(403).json({ message: 'Only sellers or admins can do this' });
  }
  next();
};

module.exports = { protect, buyerOnly, sellerOnly, adminOnly, sellerOrAdminOnly };