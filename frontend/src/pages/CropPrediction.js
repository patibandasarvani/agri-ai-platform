import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import axios from 'axios';
import {
  Sprout,
  Droplets,
  Thermometer,
  Wind,
  Gauge,
  Cloud,
  Loader2,
  CheckCircle,
  AlertCircle,
  MapPin,
  Sun,
  Flower,
  TreePine,
  Wheat,
  Leaf,
  BarChart3,
  TrendingUp,
  Calendar,
  AlertTriangle,
  Info,
  Star,
  Award,
  Target,
  Zap
} from 'lucide-react';

const CropPrediction = () => {
  const [isPredicting, setIsPredicting] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [currentLocation, setCurrentLocation] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState('');
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    getValues
  } = useForm();

  // 20+ Crop types with detailed information
  const cropTypes = [
    { 
      name: 'Rice', 
      icon: '🌾', 
      category: 'Cereal',
      season: 'Monsoon',
      waterNeed: 'High',
      growingPeriod: '120-150 days',
      yield: '3-5 tons/ha',
      profitability: 'High'
    },
    { 
      name: 'Wheat', 
      icon: '🌾', 
      category: 'Cereal',
      season: 'Winter',
      waterNeed: 'Medium',
      growingPeriod: '110-130 days',
      yield: '2.5-4 tons/ha',
      profitability: 'Medium'
    },
    { 
      name: 'Corn', 
      icon: '🌽', 
      category: 'Cereal',
      season: 'Summer',
      waterNeed: 'Medium',
      growingPeriod: '90-120 days',
      yield: '4-6 tons/ha',
      profitability: 'High'
    },
    { 
      name: 'Sugarcane', 
      icon: '🎋', 
      category: 'Cash Crop',
      season: 'Year-round',
      waterNeed: 'High',
      growingPeriod: '300-365 days',
      yield: '60-80 tons/ha',
      profitability: 'Very High'
    },
    { 
      name: 'Cotton', 
      icon: '🌿', 
      category: 'Fiber',
      season: 'Summer',
      waterNeed: 'Medium',
      growingPeriod: '150-180 days',
      yield: '1.5-2 tons/ha',
      profitability: 'High'
    },
    { 
      name: 'Soybean', 
      icon: '🫘', 
      category: 'Legume',
      season: 'Monsoon',
      waterNeed: 'Medium',
      growingPeriod: '90-120 days',
      yield: '1.5-2.5 tons/ha',
      profitability: 'Medium'
    },
    { 
      name: 'Potato', 
      icon: '🥔', 
      category: 'Vegetable',
      season: 'Winter',
      waterNeed: 'Medium',
      growingPeriod: '90-110 days',
      yield: '20-30 tons/ha',
      profitability: 'High'
    },
    { 
      name: 'Tomato', 
      icon: '🍅', 
      category: 'Vegetable',
      season: 'Year-round',
      waterNeed: 'Medium',
      growingPeriod: '60-80 days',
      yield: '25-40 tons/ha',
      profitability: 'High'
    },
    { 
      name: 'Onion', 
      icon: '🧅', 
      category: 'Vegetable',
      season: 'Winter',
      waterNeed: 'Low',
      growingPeriod: '120-150 days',
      yield: '15-25 tons/ha',
      profitability: 'Medium'
    },
    { 
      name: 'Chili', 
      icon: '🌶️', 
      category: 'Spice',
      season: 'Summer',
      waterNeed: 'Medium',
      growingPeriod: '90-120 days',
      yield: '2-4 tons/ha',
      profitability: 'High'
    },
    { 
      name: 'Turmeric', 
      icon: '🟡', 
      category: 'Spice',
      season: 'Monsoon',
      waterNeed: 'Medium',
      growingPeriod: '200-240 days',
      yield: '15-25 tons/ha',
      profitability: 'High'
    },
    { 
      name: 'Garlic', 
      icon: '🧄', 
      category: 'Spice',
      season: 'Winter',
      waterNeed: 'Low',
      growingPeriod: '120-150 days',
      yield: '8-12 tons/ha',
      profitability: 'Medium'
    },
    { 
      name: 'Ginger', 
      icon: '🫚', 
      category: 'Spice',
      season: 'Monsoon',
      waterNeed: 'Medium',
      growingPeriod: '240-270 days',
      yield: '15-20 tons/ha',
      profitability: 'High'
    },
    { 
      name: 'Banana', 
      icon: '🍌', 
      category: 'Fruit',
      season: 'Year-round',
      waterNeed: 'High',
      growingPeriod: '12-15 months',
      yield: '30-40 tons/ha',
      profitability: 'Very High'
    },
    { 
      name: 'Mango', 
      icon: '🥭', 
      category: 'Fruit',
      season: 'Summer',
      waterNeed: 'Medium',
      growingPeriod: '3-4 years',
      yield: '10-20 tons/ha',
      profitability: 'Very High'
    },
    { 
      name: 'Papaya', 
      icon: '🍈', 
      category: 'Fruit',
      season: 'Year-round',
      waterNeed: 'Medium',
      growingPeriod: '6-9 months',
      yield: '40-60 tons/ha',
      profitability: 'High'
    },
    { 
      name: 'Pomegranate', 
      icon: '🍎', 
      category: 'Fruit',
      season: 'Summer',
      waterNeed: 'Low',
      growingPeriod: '2-3 years',
      yield: '8-12 tons/ha',
      profitability: 'Very High'
    },
    { 
      name: 'Coconut', 
      icon: '🥥', 
      category: 'Tree Crop',
      season: 'Year-round',
      waterNeed: 'High',
      growingPeriod: '6-8 years',
      yield: '50-100 nuts/tree',
      profitability: 'Very High'
    },
    { 
      name: 'Tea', 
      icon: '🍵', 
      category: 'Beverage',
      season: 'Year-round',
      waterNeed: 'High',
      growingPeriod: '3-5 years',
      yield: '1.5-2 tons/ha',
      profitability: 'Very High'
    },
    { 
      name: 'Coffee', 
      icon: '☕', 
      category: 'Beverage',
      season: 'Year-round',
      waterNeed: 'Medium',
      growingPeriod: '3-4 years',
      yield: '0.8-1.2 tons/ha',
      profitability: 'Very High'
    },
    { 
      name: 'Rubber', 
      icon: '🛞', 
      category: 'Industrial',
      season: 'Year-round',
      waterNeed: 'High',
      growingPeriod: '6-7 years',
      yield: '1.5-2 tons/ha',
      profitability: 'Very High'
    },
    { 
      name: 'Jute', 
      icon: '🧶', 
      category: 'Fiber',
      season: 'Monsoon',
      waterNeed: 'High',
      growingPeriod: '120-150 days',
      yield: '2-3 tons/ha',
      profitability: 'Medium'
    },
    { 
      name: 'Mustard', 
      icon: '🌼', 
      category: 'Oilseed',
      season: 'Winter',
      waterNeed: 'Low',
      growingPeriod: '90-110 days',
      yield: '1-2 tons/ha',
      profitability: 'Medium'
    },
    { 
      name: 'Groundnut', 
      icon: '🥜', 
      category: 'Oilseed',
      season: 'Monsoon',
      waterNeed: 'Medium',
      growingPeriod: '90-120 days',
      yield: '1.5-2.5 tons/ha',
      profitability: 'High'
    }
  ];

  // Get user's current location
  const getCurrentLocation = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            const location = data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            setCurrentLocation(location);
            setValue('location', location);
            toast.success('Location detected successfully!');
          } catch (error) {
            toast.error('Could not fetch location details');
            setCurrentLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            setValue('location', `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          } finally {
            setLocationLoading(false);
          }
        },
        (error) => {
          toast.error('Could not access your location');
          setLocationLoading(false);
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
      setLocationLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setIsPredicting(true);
    try {
      const response = await axios.post('/api/predictions/crop', data);
      
      if (response.data.success) {
        setPrediction(response.data.prediction);
        toast.success('Crop prediction completed successfully!');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Prediction failed';
      toast.error(message);
    } finally {
      setIsPredicting(false);
    }
  };

  const handleReset = () => {
    reset();
    setPrediction(null);
    setCurrentLocation('');
    setSelectedCrop('');
  };

  const inputFields = [
    {
      name: 'temperature',
      label: 'Temperature',
      icon: Thermometer,
      unit: '°C',
      min: 0,
      max: 50,
      description: 'Current temperature in your area'
    },
    {
      name: 'humidity',
      label: 'Humidity',
      icon: Droplets,
      unit: '%',
      min: 0,
      max: 100,
      description: 'Relative humidity level'
    },
    {
      name: 'ph',
      label: 'Soil pH',
      icon: Gauge,
      unit: '',
      min: 0,
      max: 14,
      step: 0.1,
      description: 'Soil acidity level (0-14)'
    },
    {
      name: 'rainfall',
      label: 'Rainfall',
      icon: Cloud,
      unit: 'mm',
      min: 0,
      max: 500,
      description: 'Annual rainfall in your area'
    },
    {
      name: 'nitrogen',
      label: 'Nitrogen (N)',
      icon: Leaf,
      unit: 'kg/ha',
      min: 0,
      max: 200,
      description: 'Nitrogen content in soil'
    },
    {
      name: 'phosphorus',
      label: 'Phosphorus (P)',
      icon: Zap,
      unit: 'kg/ha',
      min: 0,
      max: 150,
      description: 'Phosphorus content in soil'
    },
    {
      name: 'potassium',
      label: 'Potassium (K)',
      icon: Wind,
      unit: 'kg/ha',
      min: 0,
      max: 200,
      description: 'Potassium content in soil'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mb-4">
          <Sprout className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
        AI Crop Prediction System 🌱
      </h1>
      <p className="text-gray-600 text-lg max-w-2xl mx-auto">
        Get personalized crop recommendations based on your soil conditions, climate, and location using advanced machine learning
      </p>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Input Form */}
      <div className="lg:col-span-2 space-y-6">
        {/* Location Input */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-green-600" />
              Location Information
            </h3>
            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={locationLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {locationLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MapPin className="h-4 w-4" />
              )}
              <span>{locationLoading ? 'Detecting...' : 'Auto Detect'}</span>
            </button>
          </div>
          
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              {...register('location', { required: 'Location is required' })}
              placeholder="Enter your farm location or use auto-detect"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          {errors.location && (
            <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
          )}
        </div>

        {/* Environmental Parameters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Sun className="h-5 w-5 mr-2 text-yellow-500" />
            Environmental Parameters
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inputFields.slice(0, 4).map((field) => {
              const Icon = field.icon;
              const value = watch(field.name);
              
              return (
                <div key={field.name}>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                    <Icon className="h-4 w-4" />
                    <span>{field.label}</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step={field.step || '1'}
                      min={field.min}
                      max={field.max}
                      {...register(field.name, {
                        required: `${field.label} is required`,
                        min: {
                          value: field.min,
                          message: `${field.label} must be at least ${field.min}`
                        },
                        max: {
                          value: field.max,
                          message: `${field.label} must not exceed ${field.max}`
                        }
                      })}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                        errors[field.name] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {field.unit && (
                      <span className="absolute right-3 top-2 text-sm text-gray-500">
                        {field.unit}
                      </span>
                    )}
                  </div>
                  {errors[field.name] && (
                    <p className="text-red-500 text-xs mt-1">{errors[field.name].message}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">{field.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Soil Parameters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Leaf className="h-5 w-5 mr-2 text-green-600" />
            Soil Nutrients
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {inputFields.slice(4).map((field) => {
              const Icon = field.icon;
              const value = watch(field.name);
              
              return (
                <div key={field.name}>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                    <Icon className="h-4 w-4" />
                    <span>{field.label}</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step={field.step || '1'}
                      min={field.min}
                      max={field.max}
                      {...register(field.name, {
                        required: `${field.label} is required`,
                        min: {
                          value: field.min,
                          message: `${field.label} must be at least ${field.min}`
                        },
                        max: {
                          value: field.max,
                          message: `${field.label} must not exceed ${field.max}`
                        }
                      })}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                        errors[field.name] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {field.unit && (
                      <span className="absolute right-3 top-2 text-sm text-gray-500">
                        {field.unit}
                      </span>
                    )}
                  </div>
                  {errors[field.name] && (
                    <p className="text-red-500 text-xs mt-1">{errors[field.name].message}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">{field.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            type="submit"
            onClick={handleSubmit(onSubmit)}
            disabled={isPredicting}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center space-x-2 font-semibold shadow-lg"
          >
            {isPredicting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Analyzing with AI...</span>
              </>
            ) : (
              <>
                <Target className="h-5 w-5" />
                <span>Predict Best Crop</span>
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Crop Showcase */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Flower className="h-5 w-5 mr-2 text-pink-500" />
            Popular Crops
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {cropTypes.slice(0, 12).map((crop, index) => (
              <div
                key={index}
                onClick={() => setSelectedCrop(crop.name)}
                className={`text-center p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedCrop === crop.name
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <div className="text-2xl mb-1">{crop.icon}</div>
                <div className="text-xs font-medium text-gray-700">{crop.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Results */}
        {prediction ? (
          <div className="space-y-6">
            {/* Main Recommendation */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg p-6 border border-green-200">
              <div className="flex items-center space-x-3 mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  AI Recommendation
                </h3>
              </div>
              
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">
                  {cropTypes.find(c => c.name === prediction.result?.predictedCrop)?.icon || '🌱'}
                </div>
                <h4 className="text-2xl font-bold text-green-700 mb-2">
                  {prediction.result?.predictedCrop || 'Rice'}
                </h4>
                <div className="flex items-center justify-center space-x-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor((prediction.result?.confidence || 0.8) * 5)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {((prediction.result?.confidence || 0.8) * 100).toFixed(1)}% Match
                  </span>
                </div>
              </div>
              
              {cropTypes.find(c => c.name === prediction.result?.predictedCrop) && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">{cropTypes.find(c => c.name === prediction.result?.predictedCrop)?.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Season:</span>
                    <span className="font-medium">{cropTypes.find(c => c.name === prediction.result?.predictedCrop)?.season}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Water Need:</span>
                    <span className="font-medium">{cropTypes.find(c => c.name === prediction.result?.predictedCrop)?.waterNeed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expected Yield:</span>
                    <span className="font-medium">{cropTypes.find(c => c.name === prediction.result?.predictedCrop)?.yield}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Profitability:</span>
                    <span className="font-medium text-green-600">{cropTypes.find(c => c.name === prediction.result?.predictedCrop)?.profitability}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Alternative Recommendations */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                Alternative Options
              </h4>
              <div className="space-y-3">
                {['Wheat', 'Corn', 'Sugarcane'].map((crop, index) => {
                  const cropInfo = cropTypes.find(c => c.name === crop);
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{cropInfo?.icon}</span>
                        <div>
                          <div className="font-medium text-gray-900">{crop}</div>
                          <div className="text-xs text-gray-500">{cropInfo?.category}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{(85 - index * 10)}%</div>
                        <div className="text-xs text-gray-500">Match</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

      {/* Farming Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
        <div className="flex items-start space-x-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              Farming Tips
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Test soil pH before planting</li>
              <li>• Consider seasonal weather patterns</li>
              <li>• Rotate crops to maintain soil health</li>
              <li>• Use organic fertilizers for better yield</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-green-100">
      <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No Prediction Yet
      </h3>
      <p className="text-gray-500 text-sm">
        Fill in your farm parameters and click "Predict Best Crop" to get AI-powered recommendations
      </p>
    </div>
  )}
        </div>
      </div>
    </div>
  );
};

export default CropPrediction;
