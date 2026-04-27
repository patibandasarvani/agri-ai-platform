const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const axios = require('axios');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(morgan('combined'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: 'testing_mode',
    ml_api: 'connected'
  });
});

// Authentication endpoints
app.post('/api/auth/register', (req, res) => {
  const { username, email, password, fullName, phone } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ 
      success: false,
      message: 'Username, email, and password are required' 
    });
  }

  // Mock user creation
  const user = {
    id: '1',
    username,
    email,
    fullName: fullName || username,
    phone: phone || '',
    role: 'farmer',
    createdAt: new Date()
  };

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    user,
    token: 'mock-jwt-token-for-testing'
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ 
      success: false,
      message: 'Email and password are required' 
    });
  }

  // Mock user login
  const user = {
    id: '1',
    username: 'farmer',
    email,
    fullName: 'Test Farmer',
    phone: '+1234567890',
    role: 'farmer',
    createdAt: new Date()
  };

  res.json({
    success: true,
    message: 'Login successful',
    user,
    token: 'mock-jwt-token-for-testing'
  });
});

// Crop prediction endpoint
app.post('/api/predictions/crop', async (req, res) => {
  try {
    const { nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall, location } = req.body;
    
    // Validate input
    if (!nitrogen || !phosphorus || !potassium || !temperature || !humidity || !ph || !rainfall) {
      return res.status(400).json({
        success: false,
        message: 'All soil and weather parameters are required'
      });
    }

    // Call Flask ML API
    const response = await axios.post(`${process.env.ML_API_URL || 'http://localhost:5000'}/predict`, {
      N: nitrogen,
      P: phosphorus,
      K: potassium,
      temperature,
      humidity,
      ph,
      rainfall
    });

    // Save prediction (mock)
    const prediction = {
      id: Date.now(),
      userId: '1',
      inputValues: { nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall, location },
      prediction: response.data.prediction,
      allPredictions: response.data.all_predictions || [],
      timestamp: new Date(),
      confidence: response.data.prediction.confidence || 0.85
    };

    res.status(201).json({
      success: true,
      message: 'Crop prediction successful',
      prediction
    });

  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({
      success: false,
      message: 'Prediction failed',
      error: error.message
    });
  }
});

// Fertilizer recommendation endpoint
app.post('/api/predictions/fertilizer', async (req, res) => {
  try {
    const { crop, soilNitrogen, soilPhosphorus, soilPotassium, area } = req.body;
    
    if (!crop || soilNitrogen === undefined || soilPhosphorus === undefined || soilPotassium === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Crop name and soil nutrient values are required'
      });
    }

    // Call Flask ML API for fertilizer recommendation
    const response = await axios.post(`${process.env.ML_API_URL || 'http://localhost:5000'}/fertilizer-recommendation`, {
      crop_name: crop,
      soil_n: soilNitrogen,
      soil_p: soilPhosphorus,
      soil_k: soilPotassium,
      area_hectares: area || 1.0
    });

    const recommendation = {
      id: Date.now(),
      userId: '1',
      crop,
      soilValues: { nitrogen: soilNitrogen, phosphorus: soilPhosphorus, potassium: soilPotassium, area },
      recommendations: response.data.recommendations || [],
      timestamp: new Date()
    };

    res.status(201).json({
      success: true,
      message: 'Fertilizer recommendation successful',
      recommendation
    });

  } catch (error) {
    console.error('Fertilizer recommendation error:', error);
    res.status(500).json({
      success: false,
      message: 'Fertilizer recommendation failed',
      error: error.message
    });
  }
});

// Get prediction history
app.get('/api/predictions/history', (req, res) => {
  const mockHistory = [
    {
      id: '1',
      prediction: { crop_name: 'Rice', confidence: 0.92 },
      inputValues: { nitrogen: 90, phosphorus: 42, potassium: 43, temperature: 25, humidity: 80, ph: 6.5, rainfall: 200 },
      timestamp: new Date(Date.now() - 86400000) // 1 day ago
    },
    {
      id: '2',
      prediction: { crop_name: 'Wheat', confidence: 0.88 },
      inputValues: { nitrogen: 75, phosphorus: 35, potassium: 40, temperature: 20, humidity: 70, ph: 6.8, rainfall: 150 },
      timestamp: new Date(Date.now() - 172800000) // 2 days ago
    }
  ];

  res.json({
    success: true,
    predictions: mockHistory,
    total: mockHistory.length
  });
});

// Get user profile
app.get('/api/users/profile', (req, res) => {
  const user = {
    id: '1',
    username: 'farmer',
    email: 'farmer@example.com',
    fullName: 'Test Farmer',
    phone: '+1234567890',
    role: 'farmer',
    location: 'Farm Location',
    farmSize: '5 hectares',
    preferredCrops: ['Rice', 'Wheat', 'Corn'],
    createdAt: new Date()
  };

  res.json({
    success: true,
    user
  });
});

// Get weather data (mock)
app.get('/api/weather/current/:location', (req, res) => {
  const { location } = req.params;
  
  const mockWeather = {
    location: location || 'Default Location',
    temperature: 25.5,
    humidity: 75,
    rainfall: 2.5,
    windSpeed: 10,
    description: 'Partly cloudy',
    timestamp: new Date()
  };

  res.json({
    success: true,
    weather: mockWeather
  });
});

// Get model info
app.get('/api/model/info', async (req, res) => {
  try {
    const response = await axios.get(`${process.env.ML_API_URL || 'http://localhost:5000'}/model-info`);
    res.json({
      success: true,
      modelInfo: response.data
    });
  } catch (error) {
    res.json({
      success: true,
      modelInfo: {
        modelType: 'Random Forest',
        accuracy: '95%',
        features: ['Nitrogen', 'Phosphorus', 'Potassium', 'Temperature', 'Humidity', 'pH', 'Rainfall'],
        supportedCrops: ['Rice', 'Wheat', 'Corn', 'Sugarcane', 'Cotton', 'Soybean']
      }
    });
  }
});

// Disease detection endpoint
app.post('/api/disease-detection', async (req, res) => {
  try {
    // This would handle file upload in production
    // For now, we'll simulate the disease detection
    
    const mockDiseases = [
      { name: 'Healthy', confidence: 0.95, severity: 'none' },
      { name: 'Leaf Blight', confidence: 0.87, severity: 'moderate' },
      { name: 'Powdery Mildew', confidence: 0.92, severity: 'mild' },
      { name: 'Leaf Spot', confidence: 0.78, severity: 'severe' }
    ];
    
    const selectedDisease = mockDiseases[Math.floor(Math.random() * mockDiseases.length)];
    
    const recommendations = {
      action: 'Apply appropriate treatment based on disease severity',
      treatment: [
        'Consult with agricultural expert',
        'Apply recommended fungicide or pesticide',
        'Remove affected plant parts',
        'Improve air circulation and drainage'
      ],
      prevention: [
        'Regular monitoring of crops',
        'Proper irrigation management',
        'Use disease-resistant varieties',
        'Maintain proper plant spacing'
      ],
      monitoring: 'Check every 2-3 days for progression'
    };
    
    const result = {
      id: Date.now(),
      userId: '1',
      detection: {
        predicted_disease: selectedDisease.name,
        confidence: selectedDisease.confidence,
        severity: selectedDisease.severity,
        is_healthy: selectedDisease.name === 'Healthy',
        all_predictions: mockDiseases
      },
      recommendations,
      timestamp: new Date(),
      imageProcessed: true
    };
    
    res.status(201).json({
      success: true,
      message: 'Disease detection completed',
      result
    });
    
  } catch (error) {
    console.error('Disease detection error:', error);
    res.status(500).json({
      success: false,
      message: 'Disease detection failed',
      error: error.message
    });
  }
});

// Pest detection endpoint
app.post('/api/pest-detection', async (req, res) => {
  try {
    const mockPests = [
      { name: 'Aphids', confidence: 0.89, count: 15, severity: 'moderate' },
      { name: 'Spider Mites', confidence: 0.76, count: 8, severity: 'mild' },
      { name: 'Whiteflies', confidence: 0.92, count: 25, severity: 'severe' },
      { name: 'Thrips', confidence: 0.84, count: 12, severity: 'moderate' },
      { name: 'No pests detected', confidence: 0.95, count: 0, severity: 'none' }
    ];
    
    const selectedPest = mockPests[Math.floor(Math.random() * mockPests.length)];
    
    const pestTreatments = {
      'Aphids': {
        treatment: ['Apply neem oil spray', 'Release ladybugs', 'Use insecticidal soap'],
        prevention: ['Remove weeds', 'Monitor new growth', 'Use reflective mulch']
      },
      'Spider Mites': {
        treatment: ['Increase humidity', 'Apply miticide', 'Use predatory mites'],
        prevention: ['Maintain proper humidity', 'Regular inspection', 'Avoid over-fertilizing']
      },
      'Whiteflies': {
        treatment: ['Use yellow sticky traps', 'Apply insecticidal soap', 'Release parasitic wasps'],
        prevention: ['Quarantine new plants', 'Use reflective mulch', 'Proper ventilation']
      },
      'Thrips': {
        treatment: ['Apply blue sticky traps', 'Use spinosad', 'Release predatory mites'],
        prevention: ['Remove weeds', 'Monitor flower buds', 'Use proper irrigation']
      }
    };
    
    const treatment = pestTreatments[selectedPest.name] || {
      treatment: ['Consult agricultural expert', 'Apply appropriate pesticide'],
      prevention: ['Regular monitoring', 'Maintain plant health']
    };
    
    const result = {
      id: Date.now(),
      userId: '1',
      detection: {
        pest_name: selectedPest.name,
        confidence: selectedPest.confidence,
        estimated_count: selectedPest.count,
        severity_level: selectedPest.severity,
        image_processed: true
      },
      recommendations: {
        immediate_action: treatment.treatment,
        prevention_measures: treatment.prevention,
        monitoring_frequency: selectedPest.severity !== 'none' ? 'Every 2-3 days' : 'Weekly'
      },
      timestamp: new Date()
    };
    
    res.status(201).json({
      success: true,
      message: 'Pest detection completed',
      result
    });
    
  } catch (error) {
    console.error('Pest detection error:', error);
    res.status(500).json({
      success: false,
      message: 'Pest detection failed',
      error: error.message
    });
  }
});

// Crop stress analysis endpoint
app.post('/api/crop-stress-analysis', async (req, res) => {
  try {
    const { location, crop_type, area_hectares, sensor_data, weather_data } = req.body;
    
    if (!location || !crop_type || !area_hectares) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: location, crop_type, area_hectares'
      });
    }
    
    // Generate NDVI values (mock satellite data)
    const ndviValues = Array.from({ length: 10 }, () => Math.random() * 0.6 + 0.3);
    const currentNDVI = ndviValues[ndviValues.length - 1];
    
    let stressLevel, stressPercentage;
    if (currentNDVI > 0.7) {
      stressLevel = 'low';
      stressPercentage = Math.random() * 10 + 5;
    } else if (currentNDVI > 0.5) {
      stressLevel = 'moderate';
      stressPercentage = Math.random() * 20 + 15;
    } else {
      stressLevel = 'high';
      stressPercentage = Math.random() * 25 + 35;
    }
    
    const stressFactors = [];
    if (stressLevel !== 'low') {
      const possibleFactors = ['Water stress', 'Nutrient deficiency', 'Temperature stress', 'Pest pressure', 'Disease pressure'];
      stressFactors.push(...possibleFactors.slice(0, Math.min(2, possibleFactors.length)));
    }
    
    const recommendations = {
      irrigation: stressFactors.includes('Water stress') ? 'Increase irrigation frequency' : 'Maintain current irrigation schedule',
      fertilizer: stressFactors.includes('Nutrient deficiency') ? 'Apply balanced NPK fertilizer' : 'Continue current fertilization plan',
      monitoring: stressLevel === 'high' ? 'Daily monitoring recommended' : 'Weekly monitoring sufficient',
      intervention: stressLevel === 'high' ? 'Immediate intervention required' : 'Monitor and reassess in 3-5 days'
    };
    
    const result = {
      id: Date.now(),
      userId: '1',
      analysis: {
        location,
        crop_type,
        area_hectares,
        current_ndvi: currentNDVI,
        ndvi_trend: ndviValues[-1] < ndviValues[-2] ? 'decreasing' : 'stable',
        stress_level: stressLevel,
        stress_percentage: Math.round(stressPercentage * 10) / 10,
        stress_factors: stressFactors,
        historical_ndvi: ndviValues.slice(-7)
      },
      recommendations,
      alert_level: stressLevel === 'high' ? 'critical' : stressLevel === 'moderate' ? 'warning' : 'normal',
      timestamp: new Date()
    };
    
    res.status(201).json({
      success: true,
      message: 'Crop stress analysis completed',
      result
    });
    
  } catch (error) {
    console.error('Crop stress analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Crop stress analysis failed',
      error: error.message
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'AI Agriculture Platform API - Testing Mode',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      predictions: '/api/predictions',
      users: '/api/users',
      weather: '/api/weather',
      model: '/api/model/info'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5004;
app.listen(PORT, () => {
  console.log(`🚀 AI Agriculture Platform Test Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API URL: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`🤖 ML API: ${process.env.ML_API_URL || 'http://localhost:5000'}`);
  console.log(`⚠️  Running in TESTING MODE - MongoDB not required`);
});
