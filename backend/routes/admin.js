const express = require('express');
const User = require('../models/User');
const Prediction = require('../models/Prediction');
const { admin } = require('../middleware/auth');

const router = express.Router();

// Apply admin middleware to all routes
router.use(admin);

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private (Admin only)
router.get('/dashboard', async (req, res) => {
  try {
    // Get user statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: new Date(new Date().setDate(1)) }
    });

    // Get prediction statistics
    const totalPredictions = await Prediction.countDocuments();
    const cropPredictions = await Prediction.countDocuments({ type: 'crop_prediction' });
    const fertilizerPredictions = await Prediction.countDocuments({ type: 'fertilizer_recommendation' });
    const predictionsThisMonth = await Prediction.countDocuments({
      createdAt: { $gte: new Date(new Date().setDate(1)) }
    });

    // Get popular crops
    const popularCrops = await Prediction.getPopularCrops(10);

    // Get recent users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email role createdAt isActive lastLogin');

    res.json({
      success: true,
      dashboard: {
        users: {
          total: totalUsers,
          active: activeUsers,
          newThisMonth: newUsersThisMonth
        },
        predictions: {
          total: totalPredictions,
          crop: cropPredictions,
          fertilizer: fertilizerPredictions,
          thisMonth: predictionsThisMonth
        },
        popularCrops,
        recentUsers
      }
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to get dashboard data'
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users (paginated)
// @access  Private (Admin only)
router.get('/users', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) {
      query.role = role;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const users = await User.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-password')
      .exec();

    // Get total count
    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location,
        farmSize: user.farmSize,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      })),
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to get users'
    });
  }
});

// @route   PUT /api/admin/users/:id/status
// @desc    Activate/deactivate user
// @access  Private (Admin only)
router.put('/users/:id/status', async (req, res) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'isActive must be a boolean'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        error: 'Not found',
        message: 'User not found'
      });
    }

    // Prevent admin from deactivating themselves
    if (user._id.toString() === req.user.id.toString()) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Cannot change your own status'
      });
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      isActive: user.isActive
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to update user status'
    });
  }
});

// @route   GET /api/admin/predictions
// @desc    Get all predictions (admin view)
// @access  Private (Admin only)
router.get('/predictions', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      userId,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};

    if (type) {
      query.type = type;
    }

    if (userId) {
      query.user = userId;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const predictions = await Prediction.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('user', 'name email')
      .exec();

    // Get total count
    const total = await Prediction.countDocuments(query);

    res.json({
      success: true,
      predictions: predictions.map(prediction => ({
        id: prediction._id,
        type: prediction.type,
        user: prediction.user,
        result: prediction.result,
        metadata: prediction.metadata,
        isFavorite: prediction.isFavorite,
        accuracy: prediction.accuracy,
        formattedDate: prediction.formattedDate,
        createdAt: prediction.createdAt
      })),
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get predictions error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to get predictions'
    });
  }
});

module.exports = router;
