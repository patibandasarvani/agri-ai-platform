const express = require('express');
const axios = require('axios');
const { body, validationResult } = require('express-validator');
const Prediction = require('../models/Prediction');

const router = express.Router();

// @route   POST /api/predictions/crop
// @desc    Predict crop based on soil parameters
// @access  Private
router.post('/crop', [
  body('N')
    .isFloat({ min: 0, max: 250 })
    .withMessage('Nitrogen (N) must be between 0 and 250'),
  body('P')
    .isFloat({ min: 0, max: 150 })
    .withMessage('Phosphorus (P) must be between 0 and 150'),
  body('K')
    .isFloat({ min: 0, max: 200 })
    .withMessage('Potassium (K) must be between 0 and 200'),
  body('temperature')
    .isFloat({ min: 0, max: 50 })
    .withMessage('Temperature must be between 0 and 50°C'),
  body('humidity')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Humidity must be between 0 and 100%'),
  body('ph')
    .isFloat({ min: 0, max: 14 })
    .withMessage('pH must be between 0 and 14'),
  body('rainfall')
    .isFloat({ min: 0, max: 500 })
    .withMessage('Rainfall must be between 0 and 500mm'),
  body('location.latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('location.longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { N, P, K, temperature, humidity, ph, rainfall, location, notes, tags } = req.body;

    // Prepare data for ML API
    const mlApiData = { N, P, K, temperature, humidity, ph, rainfall };

    // Call Flask ML API
    const startTime = Date.now();
    const mlApiResponse = await axios.post(
      `${process.env.ML_API_URL}/predict`,
      mlApiData,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 seconds timeout
      }
    );
    const processingTime = Date.now() - startTime;

    if (!mlApiResponse.data.success) {
      throw new Error(mlApiResponse.data.error || 'ML API prediction failed');
    }

    const predictionData = mlApiResponse.data.prediction;

    // Create prediction record
    const prediction = new Prediction({
      user: req.user.id,
      type: 'crop_prediction',
      inputParameters: mlApiData,
      result: {
        predictedCrop: predictionData.crop,
        confidence: predictionData.confidence,
        allPredictions: predictionData.all_predictions
      },
      metadata: {
        modelType: predictionData.model_info.model_type,
        featureColumns: predictionData.model_info.feature_columns,
        processingTime,
        mlApiVersion: '1.0.0'
      },
      location,
      notes,
      tags: tags || []
    });

    await prediction.save();

    // Populate user data for response
    await prediction.populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Crop prediction completed successfully',
      prediction: {
        id: prediction._id,
        type: prediction.type,
        inputParameters: prediction.inputParameters,
        result: prediction.result,
        metadata: prediction.metadata,
        location: prediction.location,
        notes: prediction.notes,
        tags: prediction.tags,
        isFavorite: prediction.isFavorite,
        formattedDate: prediction.formattedDate,
        createdAt: prediction.createdAt
      }
    });
  } catch (error) {
    console.error('Crop prediction error:', error);
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        error: 'Service unavailable',
        message: 'ML service is not available. Please try again later.'
      });
    }

    if (error.response && error.response.status === 400) {
      return res.status(400).json({
        error: 'Prediction failed',
        message: error.response.data.error || 'Invalid input parameters'
      });
    }

    res.status(500).json({
      error: 'Server error',
      message: 'Failed to complete crop prediction'
    });
  }
});

// @route   POST /api/predictions/fertilizer
// @desc    Get fertilizer recommendations
// @access  Private
router.post('/fertilizer', [
  body('N')
    .isFloat({ min: 0, max: 250 })
    .withMessage('Nitrogen (N) must be between 0 and 250'),
  body('P')
    .isFloat({ min: 0, max: 150 })
    .withMessage('Phosphorus (P) must be between 0 and 150'),
  body('K')
    .isFloat({ min: 0, max: 200 })
    .withMessage('Potassium (K) must be between 0 and 200'),
  body('crop')
    .notEmpty()
    .withMessage('Crop is required'),
  body('soil_ph')
    .optional()
    .isFloat({ min: 0, max: 14 })
    .withMessage('Soil pH must be between 0 and 14'),
  body('area_hectares')
    .optional()
    .isFloat({ min: 0.1, max: 1000 })
    .withMessage('Area must be between 0.1 and 1000 hectares'),
  body('location.latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('location.longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { N, P, K, crop, soil_ph = 6.5, area_hectares = 1.0, location, notes, tags } = req.body;

    // Prepare data for ML API
    const mlApiData = { N, P, K, crop, soil_ph, area_hectares };

    // Call Flask ML API
    const startTime = Date.now();
    const mlApiResponse = await axios.post(
      `${process.env.ML_API_URL}/fertilizer-recommendation`,
      mlApiData,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 seconds timeout
      }
    );
    const processingTime = Date.now() - startTime;

    if (!mlApiResponse.data.success) {
      throw new Error(mlApiResponse.data.error || 'ML API prediction failed');
    }

    const recommendationData = mlApiResponse.data.recommendation;

    // Create prediction record
    const prediction = new Prediction({
      user: req.user.id,
      type: 'fertilizer_recommendation',
      inputParameters: { N, P, K, temperature: 25, humidity: 70, ph: soil_ph, rainfall: 100 }, // Default values for consistency
      result: {
        crop: recommendationData.crop,
        soilAnalysis: recommendationData.soil_analysis,
        fertilizerRecommendations: recommendationData.fertilizer_recommendations,
        micronutrientRecommendations: recommendationData.micronutrient_recommendations,
        applicationSchedule: recommendationData.application_schedule,
        environmentalNotes: recommendationData.environmental_notes
      },
      metadata: {
        modelType: 'Fertilizer Recommendation System',
        featureColumns: ['N', 'P', 'K', 'crop', 'soil_ph', 'area_hectares'],
        processingTime,
        mlApiVersion: '1.0.0'
      },
      location,
      notes,
      tags: tags || []
    });

    await prediction.save();

    // Populate user data for response
    await prediction.populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Fertilizer recommendation completed successfully',
      prediction: {
        id: prediction._id,
        type: prediction.type,
        inputParameters: prediction.inputParameters,
        result: prediction.result,
        metadata: prediction.metadata,
        location: prediction.location,
        notes: prediction.notes,
        tags: prediction.tags,
        isFavorite: prediction.isFavorite,
        formattedDate: prediction.formattedDate,
        createdAt: prediction.createdAt
      }
    });
  } catch (error) {
    console.error('Fertilizer recommendation error:', error);
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        error: 'Service unavailable',
        message: 'ML service is not available. Please try again later.'
      });
    }

    if (error.response && error.response.status === 400) {
      return res.status(400).json({
        error: 'Recommendation failed',
        message: error.response.data.error || 'Invalid input parameters'
      });
    }

    res.status(500).json({
      error: 'Server error',
      message: 'Failed to complete fertilizer recommendation'
    });
  }
});

// @route   GET /api/predictions
// @desc    Get user's prediction history
// @access  Private
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      favorite,
      search
    } = req.query;

    // Build query
    const query = { user: req.user.id };

    if (type) {
      query.type = type;
    }

    if (favorite === 'true') {
      query.isFavorite = true;
    }

    if (search) {
      query.$or = [
        { 'result.predictedCrop': { $regex: search, $options: 'i' } },
        { 'result.crop': { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
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
        inputParameters: prediction.inputParameters,
        result: prediction.result,
        metadata: prediction.metadata,
        location: prediction.location,
        notes: prediction.notes,
        tags: prediction.tags,
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
      message: 'Failed to get prediction history'
    });
  }
});

// @route   GET /api/predictions/:id
// @desc    Get specific prediction
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const prediction = await Prediction.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('user', 'name email');

    if (!prediction) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Prediction not found'
      });
    }

    res.json({
      success: true,
      prediction: {
        id: prediction._id,
        type: prediction.type,
        inputParameters: prediction.inputParameters,
        result: prediction.result,
        metadata: prediction.metadata,
        location: prediction.location,
        weatherData: prediction.weatherData,
        notes: prediction.notes,
        tags: prediction.tags,
        isFavorite: prediction.isFavorite,
        accuracy: prediction.accuracy,
        formattedDate: prediction.formattedDate,
        createdAt: prediction.createdAt,
        updatedAt: prediction.updatedAt
      }
    });
  } catch (error) {
    console.error('Get prediction error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to get prediction'
    });
  }
});

// @route   PUT /api/predictions/:id/favorite
// @desc    Toggle favorite status
// @access  Private
router.put('/:id/favorite', async (req, res) => {
  try {
    const prediction = await Prediction.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!prediction) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Prediction not found'
      });
    }

    prediction.isFavorite = !prediction.isFavorite;
    await prediction.save();

    res.json({
      success: true,
      message: `Prediction ${prediction.isFavorite ? 'added to' : 'removed from'} favorites`,
      isFavorite: prediction.isFavorite
    });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to update favorite status'
    });
  }
});

// @route   PUT /api/predictions/:id
// @desc    Update prediction notes and tags
// @access  Private
router.put('/:id', [
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('accuracy')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Accuracy must be between 0 and 100')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { notes, tags, accuracy } = req.body;

    const prediction = await Prediction.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!prediction) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Prediction not found'
      });
    }

    // Update fields
    if (notes !== undefined) prediction.notes = notes;
    if (tags !== undefined) prediction.tags = tags;
    if (accuracy !== undefined) prediction.accuracy = accuracy;

    await prediction.save();

    res.json({
      success: true,
      message: 'Prediction updated successfully',
      prediction: {
        id: prediction._id,
        notes: prediction.notes,
        tags: prediction.tags,
        accuracy: prediction.accuracy,
        updatedAt: prediction.updatedAt
      }
    });
  } catch (error) {
    console.error('Update prediction error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to update prediction'
    });
  }
});

// @route   DELETE /api/predictions/:id
// @desc    Delete prediction
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const prediction = await Prediction.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!prediction) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Prediction not found'
      });
    }

    res.json({
      success: true,
      message: 'Prediction deleted successfully'
    });
  } catch (error) {
    console.error('Delete prediction error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to delete prediction'
    });
  }
});

// @route   GET /api/predictions/stats/overview
// @desc    Get user's prediction statistics
// @access  Private
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await Prediction.getUserStats(req.user.id);
    const popularCrops = await Prediction.getPopularCrops(5);

    // Get recent predictions
    const recentPredictions = await Prediction.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('type result.predictedCrop result.crop createdAt isFavorite');

    res.json({
      success: true,
      stats: {
        byType: stats,
        popularCrops,
        recentPredictions: recentPredictions.map(pred => ({
          id: pred._id,
          type: pred.type,
          crop: pred.result.predictedCrop || pred.result.crop,
          createdAt: pred.createdAt,
          isFavorite: pred.isFavorite
        }))
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to get statistics'
    });
  }
});

module.exports = router;
