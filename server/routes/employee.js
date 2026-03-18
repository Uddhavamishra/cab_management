const express = require('express');
const User = require('../models/User');
const Cab = require('../models/Cab');
const Shift = require('../models/Shift');
const Attendance = require('../models/Attendance');
const Cancellation = require('../models/Cancellation');
const AddressRequest = require('../models/AddressRequest');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

router.use(protect, authorize('employee'));

// GET /api/employee/cab-info
router.get('/cab-info', async (req, res) => {
  try {
    const cab = await Cab.findOne({ employees: req.user._id })
      .populate('driver', 'name phone vehicleNumber')
      .populate('employees', 'name phone')
      .populate('office');

    if (!cab) return res.status(404).json({ message: 'No cab assigned' });

    const coPassengers = cab.employees.filter(
      e => e._id.toString() !== req.user._id.toString()
    );

    res.json({
      driver: cab.driver,
      vehicleNumber: cab.vehicleNumber,
      office: cab.office,
      coPassengers,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/employee/cancel
router.post('/cancel', async (req, res) => {
  try {
    const { type } = req.body; // 'pickup' or 'dropoff'
    if (!['pickup', 'dropoff'].includes(type)) {
      return res.status(400).json({ message: 'Type must be pickup or dropoff' });
    }

    // Find employee's cab and the shift via driver
    const cab = await Cab.findOne({ employees: req.user._id });
    if (!cab || !cab.driver) {
      return res.status(400).json({ message: 'No cab or driver assigned' });
    }

    const driver = await User.findById(cab.driver).populate('selectedShift');
    if (!driver || !driver.selectedShift) {
      return res.status(400).json({ message: 'Driver has no shift selected' });
    }

    const shift = driver.selectedShift;
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // Parse shift times for today
    const [startH, startM] = shift.startTime.split(':').map(Number);
    const [endH, endM] = shift.endTime.split(':').map(Number);

    let pickupTime = new Date(now);
    pickupTime.setHours(startH, startM, 0, 0);
    
    let dropoffTime = new Date(pickupTime);
    dropoffTime.setHours(endH, endM, 0, 0);
    
    if (endH < startH) {
      dropoffTime.setDate(dropoffTime.getDate() + 1);
    }
    
    if (endH < startH && now.getHours() < endH) {
      pickupTime.setDate(pickupTime.getDate() - 1);
      dropoffTime.setDate(dropoffTime.getDate() - 1);
    }

    const checkTime = type === 'pickup' ? pickupTime : dropoffTime;
    const diffMs = checkTime.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 2) {
      return res.status(400).json({
        message: `Cannot cancel ${type}. Must be at least 2 hours before ${type === 'pickup' ? 'shift start (' + shift.startTime + ')' : 'shift end (' + shift.endTime + ')'}.`,
      });
    }

    // Check if already cancelled
    const existing = await Cancellation.findOne({
      employee: req.user._id,
      date: today,
      type,
    });
    if (existing) {
      return res.status(400).json({ message: `Already cancelled ${type} for today` });
    }

    const cancellation = await Cancellation.create({
      employee: req.user._id,
      shift: shift._id,
      driver: cab.driver,
      type,
      date: today,
    });

    res.status(201).json(cancellation);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/employee/cancellations — today's cancellations for current employee
router.get('/cancellations', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const cancellations = await Cancellation.find({
      employee: req.user._id,
      date: today,
    });
    res.json(cancellations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/employee/attendance
router.post('/attendance', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    let attendance = await Attendance.findOne({
      employee: req.user._id,
      date: today,
    });

    if (attendance) {
      attendance.present = !attendance.present;
      await attendance.save();
    } else {
      attendance = await Attendance.create({
        employee: req.user._id,
        date: today,
        present: true,
      });
    }

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/employee/attendance
router.get('/attendance', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const attendance = await Attendance.findOne({
      employee: req.user._id,
      date: today,
    });
    res.json(attendance || { present: false });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/employee/address-request
router.post('/address-request', async (req, res) => {
  try {
    const { newAddress } = req.body;
    if (!newAddress) return res.status(400).json({ message: 'New address required' });

    const request = await AddressRequest.create({
      employee: req.user._id,
      newAddress,
    });

    await User.findByIdAndUpdate(req.user._id, {
      pendingAddress: newAddress,
      addressApproved: false,
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/employee/address-requests
router.get('/address-requests', async (req, res) => {
  try {
    const requests = await AddressRequest.find({ employee: req.user._id })
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
