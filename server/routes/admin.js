const express = require('express');
const User = require('../models/User');
const Office = require('../models/Office');
const Shift = require('../models/Shift');
const Cab = require('../models/Cab');
const Attendance = require('../models/Attendance');
const AddressRequest = require('../models/AddressRequest');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

router.use(protect, authorize('admin'));

// ===================== USER MANAGEMENT =====================

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : { role: { $in: ['driver', 'employee'] } };
    const users = await User.find(filter)
      .select('-password')
      .populate('assignedOffice')
      .populate('assignedCab');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/admin/users
router.post('/users', async (req, res) => {
  try {
    const { username, password, role, name, phone, vehicleNumber, residentialAddress } = req.body;
    if (!username || !password || !role || !name) {
      return res.status(400).json({ message: 'Username, password, role, and name are required' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const user = await User.create({
      username, password, role, name, phone,
      vehicleNumber: role === 'driver' ? vehicleNumber : undefined,
      residentialAddress: role === 'employee' ? residentialAddress : undefined,
    });

    const userObj = user.toObject();
    delete userObj.password;
    res.status(201).json(userObj);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/admin/users/:id
router.put('/users/:id', async (req, res) => {
  try {
    const { name, phone, vehicleNumber, residentialAddress, role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (vehicleNumber !== undefined) user.vehicleNumber = vehicleNumber;
    if (residentialAddress !== undefined) user.residentialAddress = residentialAddress;
    if (role) user.role = role;

    await user.save();
    const userObj = user.toObject();
    delete userObj.password;
    res.json(userObj);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Remove user from any cabs
    await Cab.updateMany(
      { $or: [{ driver: user._id }, { employees: user._id }] },
      { $pull: { employees: user._id, route: user._id }, $unset: { driver: user._id } }
    );

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/admin/users/:id/reset-password
router.put('/users/:id/reset-password', async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword) return res.status(400).json({ message: 'New password is required' });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ===================== OFFICE MANAGEMENT =====================

// GET /api/admin/offices
router.get('/offices', async (req, res) => {
  try {
    const offices = await Office.find();
    res.json(offices);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/admin/offices
router.post('/offices', async (req, res) => {
  try {
    const { name, address } = req.body;
    if (!name || !address) return res.status(400).json({ message: 'Name and address required' });

    const count = await Office.countDocuments();
    if (count >= 2) return res.status(400).json({ message: 'Maximum 2 offices allowed' });

    const office = await Office.create({ name, address });
    res.status(201).json(office);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/admin/offices/:id
router.put('/offices/:id', async (req, res) => {
  try {
    const office = await Office.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!office) return res.status(404).json({ message: 'Office not found' });
    res.json(office);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/admin/offices/:id
router.delete('/offices/:id', async (req, res) => {
  try {
    await Office.findByIdAndDelete(req.params.id);
    res.json({ message: 'Office deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ===================== SHIFT MANAGEMENT =====================

// GET /api/admin/shifts
router.get('/shifts', async (req, res) => {
  try {
    const shifts = await Shift.find().populate('office');
    res.json(shifts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/admin/shifts
router.post('/shifts', async (req, res) => {
  try {
    const { startTime, office, label } = req.body;
    if (!startTime || !office) return res.status(400).json({ message: 'Start time and office required' });

    // Calculate end time (+9 hours)
    const [hours, minutes] = startTime.split(':').map(Number);
    const endHours = (hours + 9) % 24;
    const endTime = `${String(endHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

    const shift = await Shift.create({ startTime, endTime, office, label });
    const populated = await shift.populate('office');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/admin/shifts/:id
router.delete('/shifts/:id', async (req, res) => {
  try {
    await Shift.findByIdAndDelete(req.params.id);
    res.json({ message: 'Shift deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ===================== CAB MANAGEMENT =====================

// GET /api/admin/cabs
router.get('/cabs', async (req, res) => {
  try {
    const cabs = await Cab.find()
      .populate('driver', '-password')
      .populate('employees', '-password')
      .populate('office');
    res.json(cabs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/admin/cabs
router.post('/cabs', async (req, res) => {
  try {
    const { vehicleNumber, driverId, officeId } = req.body;
    if (!vehicleNumber) return res.status(400).json({ message: 'Vehicle number required' });

    const cab = await Cab.create({
      vehicleNumber,
      driver: driverId || undefined,
      office: officeId || undefined,
    });

    // Update driver's assignedCab
    if (driverId) {
      await User.findByIdAndUpdate(driverId, { assignedCab: cab._id, assignedOffice: officeId });
    }

    const populated = await Cab.findById(cab._id)
      .populate('driver', '-password')
      .populate('employees', '-password')
      .populate('office');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/admin/cabs/:id — update cab details
router.put('/cabs/:id', async (req, res) => {
  try {
    const { vehicleNumber, driverId, officeId } = req.body;
    const cab = await Cab.findById(req.params.id);
    if (!cab) return res.status(404).json({ message: 'Cab not found' });

    if (vehicleNumber) cab.vehicleNumber = vehicleNumber;
    if (driverId !== undefined) {
      // Unassign old driver
      if (cab.driver) {
        await User.findByIdAndUpdate(cab.driver, { $unset: { assignedCab: 1 } });
      }
      cab.driver = driverId || undefined;
      if (driverId) {
        await User.findByIdAndUpdate(driverId, { assignedCab: cab._id, assignedOffice: cab.office });
      }
    }
    if (officeId !== undefined) cab.office = officeId;

    await cab.save();
    const populated = await Cab.findById(cab._id)
      .populate('driver', '-password')
      .populate('employees', '-password')
      .populate('office');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/admin/cabs/:id/assign-employee
router.post('/cabs/:id/assign-employee', async (req, res) => {
  try {
    const { employeeId } = req.body;
    if (!employeeId) return res.status(400).json({ message: 'Employee ID required' });

    // Remove employee from any other cab first
    await Cab.updateMany(
      { employees: employeeId },
      { $pull: { employees: employeeId, route: employeeId } }
    );

    const cab = await Cab.findById(req.params.id);
    if (!cab) return res.status(404).json({ message: 'Cab not found' });

    cab.employees.push(employeeId);
    cab.route.push(employeeId);
    await cab.save();

    // Update employee's assignedCab
    await User.findByIdAndUpdate(employeeId, { assignedCab: cab._id, assignedOffice: cab.office });

    const populated = await Cab.findById(cab._id)
      .populate('driver', '-password')
      .populate('employees', '-password')
      .populate('office');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/admin/cabs/:id/remove-employee
router.post('/cabs/:id/remove-employee', async (req, res) => {
  try {
    const { employeeId } = req.body;
    const cab = await Cab.findById(req.params.id);
    if (!cab) return res.status(404).json({ message: 'Cab not found' });

    cab.employees.pull(employeeId);
    cab.route.pull(employeeId);
    await cab.save();

    await User.findByIdAndUpdate(employeeId, { $unset: { assignedCab: 1, assignedOffice: 1 } });

    const populated = await Cab.findById(cab._id)
      .populate('driver', '-password')
      .populate('employees', '-password')
      .populate('office');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/admin/cabs/:id
router.delete('/cabs/:id', async (req, res) => {
  try {
    const cab = await Cab.findById(req.params.id);
    if (!cab) return res.status(404).json({ message: 'Cab not found' });

    // Unassign all employees and driver
    await User.updateMany(
      { assignedCab: cab._id },
      { $unset: { assignedCab: 1 } }
    );

    await Cab.findByIdAndDelete(req.params.id);
    res.json({ message: 'Cab deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ===================== ADDRESS APPROVALS =====================

// GET /api/admin/address-requests
router.get('/address-requests', async (req, res) => {
  try {
    const requests = await AddressRequest.find()
      .populate('employee', 'name username residentialAddress phone')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/admin/address-requests/:id
router.put('/address-requests/:id', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected' });
    }

    const request = await AddressRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.status = status;
    await request.save();

    if (status === 'approved') {
      await User.findByIdAndUpdate(request.employee, {
        residentialAddress: request.newAddress,
        pendingAddress: null,
        addressApproved: true,
      });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ===================== ATTENDANCE =====================

// GET /api/admin/attendance
router.get('/attendance', async (req, res) => {
  try {
    const { date } = req.query;
    const filter = date ? { date } : {};
    const attendance = await Attendance.find(filter)
      .populate('employee', 'name username phone')
      .sort({ date: -1 });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
