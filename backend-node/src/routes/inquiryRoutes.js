const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/inquiryController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/',              protect,            ctrl.createInquiry);
router.get('/',               protect,            ctrl.getInquiries);
router.get('/:id',            protect,            ctrl.getInquiry);
router.post('/:id/messages',  protect,            ctrl.addMessage);
router.patch('/:id',          protect, adminOnly,  ctrl.updateInquiry);

module.exports = router;
