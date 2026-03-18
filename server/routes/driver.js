const express = require('express');
const User = require('../models/User');
const Shift = require('../models/Shift');
const Cab = require('../models/Cab');
const Cancellation = require('../models/Cancellation');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

router.use(protect, authorize('driver'));

// GET /api/driver/office — view assigned office
router.get('/office', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('assignedOffice');
    if (!user.assignedOffice) {
      return res.status(404).json({ message: 'No office assigned' });
    }
    res.json(user.assignedOffice);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/driver/shifts — available shifts for driver's office
router.get('/shifts', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const shiftsRaw = await Shift.find({ office: user.assignedOffice }).populate('office');
    
    const shifts = [];
    for (let shift of shiftsRaw) {
      const assignedEmployees = await User.find({ selectedShift: shift._id, role: 'employee' }).select('name phone residentialAddress');
      shifts.push({
        ...shift.toObject(),
        assignedEmployees
      });
    }
    
    res.json(shifts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/driver/select-shift
router.post('/select-shift', async (req, res) => {
  try {
    const { shiftId } = req.body;
    if (!shiftId) return res.status(400).json({ message: 'Shift ID required' });

    await User.findByIdAndUpdate(req.user._id, { selectedShift: shiftId });
    const shift = await Shift.findById(shiftId).populate('office');
    res.json({ message: 'Shift selected', shift });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/driver/selected-shift
router.get('/selected-shift', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'selectedShift',
      populate: { path: 'office' },
    });
    res.json(user.selectedShift || null);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/driver/manifest — list assigned employees
router.get('/manifest', async (req, res) => {
  try {
    const cab = await Cab.findOne({ driver: req.user._id })
      .populate('employees', 'name phone residentialAddress')
      .populate('office');

    if (!cab) return res.status(404).json({ message: 'No cab assigned' });

    // Get today's cancellations
    const today = new Date().toISOString().split('T')[0];
    const cancellations = await Cancellation.find({
      employee: { $in: cab.employees.map(e => e._id) },
      date: today,
    });

    const cancelledMap = {};
    cancellations.forEach(c => {
      cancelledMap[c.employee.toString()] = cancelledMap[c.employee.toString()] || [];
      cancelledMap[c.employee.toString()].push(c.type);
    });

    // Use the route order (or employees order if route is not set)
    const orderedIds = cab.route.length > 0 ? cab.route : cab.employees.map(e => e._id);
    const employeeMap = {};
    cab.employees.forEach(e => { employeeMap[e._id.toString()] = e; });

    const manifest = orderedIds
      .map(id => employeeMap[id.toString()])
      .filter(Boolean)
      .map(emp => ({
        _id: emp._id,
        name: emp.name,
        phone: emp.phone,
        address: emp.residentialAddress,
        cancelledPickup: (cancelledMap[emp._id.toString()] || []).includes('pickup'),
        cancelledDropoff: (cancelledMap[emp._id.toString()] || []).includes('dropoff'),
      }));

    res.json({ cab: { vehicleNumber: cab.vehicleNumber, office: cab.office }, manifest });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/driver/manifest/reorder
router.put('/manifest/reorder', async (req, res) => {
  try {
    const { order } = req.body; // array of employee IDs in new order
    if (!order || !Array.isArray(order)) {
      return res.status(400).json({ message: 'Order array required' });
    }

    const cab = await Cab.findOne({ driver: req.user._id });
    if (!cab) return res.status(404).json({ message: 'No cab assigned' });

    cab.route = order;
    await cab.save();
    res.json({ message: 'Route order updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/driver/notifications
router.get('/notifications', async (req, res) => {
  try {
    const notifications = await Cancellation.find({ driver: req.user._id })
      .populate('employee', 'name phone residentialAddress')
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/driver/notifications/:id/acknowledge
router.put('/notifications/:id/acknowledge', async (req, res) => {
  try {
    const notification = await Cancellation.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Not found' });
    if (notification.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    notification.acknowledged = true;
    await notification.save();
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
