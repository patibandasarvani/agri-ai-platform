const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const PlantDiseasePrediction = require('../models/PlantDiseasePrediction');
const { protect } = require('../middleware/auth');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/plant-disease';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Helper function to call Flask ML API
const callMLApi = async (imagePath) => {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const imageBase64 = imageBuffer.toString('base64');
    
    const response = await axios.post('http://localhost:5002/predict_base64', {
      image: imageBase64
    }, {
      timeout: 30000 // 30 seconds timeout
    });
    
    return response.data;
  } catch (error) {
    console.error('ML API Error:', error.message);
    throw new Error('Failed to get prediction from ML service');
  }
};

// POST /api/plant-disease/upload-image
router.post('/upload-image', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const { 
      location, 
      cropInfo, 
      notes 
    } = req.body;

    console.log(`🌱 Processing plant disease image: ${req.file.filename}`);

    // Call ML API for disease prediction
    const mlResult = await callMLApi(req.file.path);

    if (!mlResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to analyze image',
        error: mlResult.error
      });
    }

    const prediction = mlResult.prediction;
    const recommendations = mlResult.recommendations;

    // Calculate severity
    let severity = 'medium';
    if (prediction.confidence > 0.9) severity = 'severe';
    else if (prediction.confidence > 0.7) severity = 'high';
    else if (prediction.confidence < 0.5) severity = 'low';

    // Parse location if provided
    let parsedLocation = null;
    if (location) {
      try {
        parsedLocation = JSON.parse(location);
      } catch (e) {
        console.warn('Invalid location format');
      }
    }

    // Parse crop info if provided
    let parsedCropInfo = null;
    if (cropInfo) {
      try {
        parsedCropInfo = JSON.parse(cropInfo);
      } catch (e) {
        console.warn('Invalid crop info format');
      }
    }

    // Save prediction to database
    const plantDiseasePrediction = new PlantDiseasePrediction({
      userId: req.user.id,
      imageName: req.file.filename,
      imageOriginalName: req.file.originalname,
      imagePath: req.file.path,
      disease: prediction.disease,
      confidence: prediction.confidence,
      pesticide: recommendations.pesticide,
      usage: recommendations.usage,
      applicationMethod: recommendations.application_method,
      frequency: recommendations.frequency,
      safetyTips: recommendations.safety_tips,
      prevention: recommendations.prevention,
      soilManagement: recommendations.soil_management,
      waterManagement: recommendations.water_management,
      fertilizerSuggestion: recommendations.fertilizer_suggestion,
      allPredictions: new Map(Object.entries(prediction.all_predictions)),
      location: parsedLocation,
      cropInfo: parsedCropInfo,
      notes: notes,
      severity: severity
    });

    await plantDiseasePrediction.save();

    console.log(`✅ Disease prediction saved: ${prediction.disease} (${(prediction.confidence * 100).toFixed(1)}%)`);

    res.json({
      success: true,
      data: {
        id: plantDiseasePrediction._id,
        prediction: prediction,
        recommendations: recommendations,
        severity: severity,
        saved: true,
        timestamp: plantDiseasePrediction.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Error in upload-image:', error);
    
    // Clean up uploaded file if error occurs
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to process image',
      error: error.message
    });
  }
});

// POST /api/plant-disease/predict-disease
router.post('/predict-disease', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    console.log(`🔍 Quick disease prediction for: ${req.file.filename}`);

    // Call ML API for prediction only
    const mlResult = await callMLApi(req.file.path);

    if (!mlResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to analyze image',
        error: mlResult.error
      });
    }

    // Clean up temporary file
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.json({
      success: true,
      data: {
        prediction: mlResult.prediction,
        recommendations: mlResult.recommendations,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error in predict-disease:', error);
    
    // Clean up uploaded file if error occurs
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to predict disease',
      error: error.message
    });
  }
});

// GET /api/plant-disease/history
router.get('/history', protect, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      disease,
      status,
      startDate,
      endDate,
      severity
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      disease,
      status,
      startDate,
      endDate
    };

    // Add severity filter if provided
    let queryOptions = options;
    if (severity) {
      queryOptions.severity = severity;
    }

    const result = await PlantDiseasePrediction.getUserHistory(req.user.id, queryOptions);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('❌ Error in history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch prediction history',
      error: error.message
    });
  }
});

// GET /api/plant-disease/statistics
router.get('/statistics', protect, async (req, res) => {
  try {
    // Get user-specific statistics
    const userStats = await PlantDiseasePrediction.getDiseaseStats(req.user.id);
    
    // Get overall statistics for comparison
    const overallStats = await PlantDiseasePrediction.getDiseaseStats();

    // Get user's prediction count
    const totalPredictions = await PlantDiseasePrediction.countDocuments({ userId: req.user.id });
    
    // Get healthy vs diseased count
    const healthyCount = await PlantDiseasePrediction.countDocuments({ 
      userId: req.user.id,
      disease: { $regex: 'healthy', $options: 'i' }
    });
    
    const diseasedCount = totalPredictions - healthyCount;

    // Get recent predictions
    const recentPredictions = await PlantDiseasePrediction.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('disease confidence createdAt status severity');

    res.json({
      success: true,
      data: {
        userStats,
        overallStats,
        summary: {
          totalPredictions,
          healthyCount,
          diseasedCount,
          diseaseRate: totalPredictions > 0 ? ((diseasedCount / totalPredictions) * 100).toFixed(1) : 0
        },
        recentPredictions
      }
    });

  } catch (error) {
    console.error('❌ Error in statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
});

// GET /api/plant-disease/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const prediction = await PlantDiseasePrediction.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).populate('userId', 'name email');

    if (!prediction) {
      return res.status(404).json({
        success: false,
        message: 'Prediction not found'
      });
    }

    res.json({
      success: true,
      data: prediction
    });

  } catch (error) {
    console.error('❌ Error in get prediction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch prediction',
      error: error.message
    });
  }
});

// PUT /api/plant-disease/:id/treatment
router.put('/:id/treatment', protect, async (req, res) => {
  try {
    const { 
      applied, 
      date, 
      followUp, 
      followUpDate, 
      notes, 
      status 
    } = req.body;

    const prediction = await PlantDiseasePrediction.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!prediction) {
      return res.status(404).json({
        success: false,
        message: 'Prediction not found'
      });
    }

    const treatmentData = {
      applied,
      date: date ? new Date(date) : new Date(),
      followUp,
      followUpDate: followUpDate ? new Date(followUpDate) : null,
      notes,
      status
    };

    await prediction.updateTreatment(treatmentData);

    res.json({
      success: true,
      message: 'Treatment information updated successfully',
      data: prediction
    });

  } catch (error) {
    console.error('❌ Error in update treatment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update treatment information',
      error: error.message
    });
  }
});

// DELETE /api/plant-disease/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const prediction = await PlantDiseasePrediction.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!prediction) {
      return res.status(404).json({
        success: false,
        message: 'Prediction not found'
      });
    }

    // Delete associated image file
    if (prediction.imagePath && fs.existsSync(prediction.imagePath)) {
      fs.unlinkSync(prediction.imagePath);
    }

    await PlantDiseasePrediction.deleteOne({ _id: req.params.id });

    res.json({
      success: true,
      message: 'Prediction deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error in delete prediction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete prediction',
      error: error.message
    });
  }
});

// GET /api/plant-disease/dashboard
router.get('/dashboard', protect, async (req, res) => {
  try {
    // Get recent predictions
    const recentPredictions = await PlantDiseasePrediction.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('disease confidence createdAt status severity pesticide');

    // Get disease distribution
    const diseaseStats = await PlantDiseasePrediction.getDiseaseStats(req.user.id);

    // Get monthly trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrend = await PlantDiseasePrediction.aggregate([
      {
        $match: {
          userId: req.user.id,
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          healthy: {
            $sum: {
              $cond: [{ $regexMatch: { input: '$disease', regex: /healthy/i } }, 1, 0]
            }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Get upcoming follow-ups
    const upcomingFollowUps = await PlantDiseasePrediction.find({
      userId: req.user.id,
      followUpRequired: true,
      followUpDate: { $gte: new Date() },
      status: { $ne: 'resolved' }
    })
    .sort({ followUpDate: 1 })
    .limit(5)
    .select('disease followUpDate pesticide');

    res.json({
      success: true,
      data: {
        recentPredictions,
        diseaseStats,
        monthlyTrend,
        upcomingFollowUps,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error in dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
});

module.exports = router;
