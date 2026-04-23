const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/appointmentController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public (authenticated) — browsing
router.get('/available',    protect, ctrl.getAvailableSlots);
router.get('/gemologists',  protect, ctrl.getGemologists);

// User — own appointments
router.get('/',             protect, ctrl.getAppointments);
router.post('/book',        protect, ctrl.bookAppointment);
router.patch('/:id/cancel', protect, ctrl.cancelAppointment);

// Admin — status management
router.patch('/:id',        protect, adminOnly, ctrl.updateAppointmentStatus);

module.exports = router;
