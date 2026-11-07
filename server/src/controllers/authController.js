import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

/**
 * Authentic Database Login: Strictly for single Admin (Shailesh Bhabad)
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter both administrator ID/email and password.' });
    }

    const input = (email || '').trim();
    const inputLower = input.toLowerCase();

    // Query database strictly for the single authorized admin
    const adminUser = await User.findOne({
      role: 'admin',
      $or: [
        { email: inputLower },
        { name: new RegExp(`^${input}$`, 'i') }
      ]
    });

    if (!adminUser) {
      return res.status(401).json({
        error: 'Access denied: Only the designated system administrator (Shailesh Bhabad) has login access.'
      });
    }

    // Verify password against hashed password stored in the database
    const isMatch = await adminUser.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        error: 'Invalid administrator password. Please check and try again.'
      });
    }

    // Issue JWT token
    const token = jwt.sign(
      { id: adminUser._id, role: adminUser.role, email: adminUser.email },
      process.env.JWT_SECRET || 'civiclens_secret',
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
        department: adminUser.department,
        zone: adminUser.zone
      }
    });
  } catch (error) {
    console.error('[login] Error:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Get authorities list for department assignment dropdown
 */
export const getAuthorities = async (req, res) => {
  try {
    const authorities = await User.find({ role: { $in: ['authority', 'admin'] } }).select('-password').sort({ createdAt: -1 });
    return res.json({ success: true, authorities });
  } catch (error) {
    console.error('[getAuthorities] Error:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Create / Register a new field authority officer in MongoDB
 */
export const createAuthority = async (req, res) => {
  try {
    const { name, email, department = 'Roads', zone = 'Zone B (Pimpri)' } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Officer name and email are required.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ error: `An officer with email ${email} already exists in database.` });
    }

    const newOfficer = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: 'authority_officer',
      role: 'authority',
      department: department.trim(),
      zone: zone.trim(),
      isActive: true
    });

    const officerSafe = {
      _id: newOfficer._id,
      name: newOfficer.name,
      email: newOfficer.email,
      role: newOfficer.role,
      department: newOfficer.department,
      zone: newOfficer.zone,
      isActive: newOfficer.isActive,
      createdAt: newOfficer.createdAt
    };

    return res.status(201).json({
      success: true,
      message: `Officer ${name} registered successfully in database.`,
      officer: officerSafe
    });
  } catch (error) {
    console.error('[createAuthority] Error:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Update registered officer details in MongoDB
 */
export const updateAuthority = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, department, zone, isActive } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'Officer not found in database.' });
    }

    // Check if email is already taken by another user
    if (email && email.toLowerCase().trim() !== user.email) {
      const existing = await User.findOne({ email: email.toLowerCase().trim(), _id: { $ne: id } });
      if (existing) {
        return res.status(400).json({ error: `Email ${email} is already registered to another officer.` });
      }
      user.email = email.toLowerCase().trim();
    }

    if (name) user.name = name.trim();
    if (department) user.department = department.trim();
    if (zone) user.zone = zone.trim();
    if (typeof isActive === 'boolean') user.isActive = isActive;

    await user.save();

    const officerSafe = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      zone: user.zone,
      isActive: user.isActive,
      updatedAt: user.updatedAt
    };

    return res.json({
      success: true,
      message: `Officer ${user.name} details updated successfully in database.`,
      officer: officerSafe
    });
  } catch (error) {
    console.error('[updateAuthority] Error:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Delete officer from MongoDB
 */
export const deleteAuthority = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'Officer not found in database.' });
    }

    // Protect single designated administrator
    if (user.role === 'admin' || user.email === 'admin@civiclens.in') {
      return res.status(403).json({ error: 'Designated system administrator cannot be deleted.' });
    }

    await User.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: `Officer ${user.name} removed successfully from database.`
    });
  } catch (error) {
    console.error('[deleteAuthority] Error:', error);
    return res.status(500).json({ error: error.message });
  }
};
