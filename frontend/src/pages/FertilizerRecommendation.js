import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import axios from 'axios';
import {
  Beaker,
  Droplets,
  Gauge,
  Thermometer,
  Wind,
  Cloud,
  Loader2,
  CheckCircle,
  AlertCircle,
  Leaf,
  Flower
} from 'lucide-react';

const FertilizerRecommendation = () => {
  const [isPredicting, setIsPredicting] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm();

  const onSubmit = async (data) => {
    setIsPredicting(true);
    try {
      const response = await axios.post('/api/predictions/fertilizer', data);
      
      if (response.data.success) {
        setRecommendation(response.data.prediction);
        toast.success('Fertilizer recommendation completed successfully!');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Recommendation failed';
      toast.error(message);
    } finally {
      setIsPredicting(false);
    }
  };

  const handleReset = () => {
    reset();
    setRecommendation(null);
  };

  const inputFields = [
    {
      name: 'N',
      label: 'Nitrogen (N)',
      icon: Droplets,
      unit: 'kg/ha',
      min: 0,
      max: 250,
      description: 'Current nitrogen level in soil'
    },
    {
      name: 'P',
      label: 'Phosphorus (P)',
      icon: Gauge,
      unit: 'kg/ha',
      min: 0,
      max: 150,
      description: 'Current phosphorus level in soil'
    },
    {
      name: 'K',
      label: 'Potassium (K)',
      icon: Wind,
      unit: 'kg/ha',
      min: 0,
      max: 200,
      description: 'Current potassium level in soil'
    },
    {
      name: 'temperature',
      label: 'Temperature',
      icon: Thermometer,
      unit: '°C',
      min: 0,
      max: 50,
      description: 'Current temperature'
    },
    {
      name: 'humidity',
      label: 'Humidity',
      icon: Droplets,
      unit: '%',
      min: 0,
      max: 100,
      description: 'Relative humidity'
    },
    {
      name: 'ph',
      label: 'pH Level',
      icon: Gauge,
      unit: '',
      min: 0,
      max: 14,
      step: 0.1,
      description: 'Soil pH level'
    },
    {
      name: 'rainfall',
      label: 'Rainfall',
      icon: Cloud,
      unit: 'mm',
      min: 0,
      max: 500,
      description: 'Recent rainfall amount'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Fertilizer Recommendations 🌱
        </h1>
        <p className="mt-2 text-gray-600">
          Get personalized fertilizer recommendations based on your soil conditions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Soil Parameters
              </h2>
              
              <div className="space-y-4">
                {inputFields.map((field) => {
                  const Icon = field.icon;
                  const value = watch(field.name);
                  
                  return (
                    <div key={field.name}>
                      <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-1">
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
                          className={`appearance-none block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                            errors[field.name]
                              ? 'border-red-500'
                              : 'border-gray-300'
                          }`}
                        />
                        {field.unit && (
                          <span className="absolute right-3 top-2 text-sm text-gray-500">
                            {field.unit}
                          </span>
                        )}
                      </div>
                      {errors[field.name] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors[field.name].message}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {field.description}
                      </p>
                      
                      {/* Visual indicator for value */}
                      {value !== undefined && (
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${((value - field.min) / (field.max - field.min)) * 100}%`
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={isPredicting}
                className="flex-1 bg-primary-600 text-white py-3 px-4 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {isPredicting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Beaker className="h-5 w-5" />
                    <span>Get Recommendations</span>
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* Results */}
        <div>
          {recommendation ? (
            <div className="space-y-6">
              {/* Main Recommendation */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Fertilizer Recommendations
                  </h2>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold text-green-900 mb-2">Recommended Fertilizer</h3>
                    <p className="text-green-800">
                      {recommendation.result?.fertilizer || 'NPK 20-20-20'}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">Application Rate</h3>
                    <p className="text-blue-800">
                      {recommendation.result?.applicationRate || '50 kg per hectare'}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h3 className="font-semibold text-purple-900 mb-2">Cost Estimate</h3>
                    <p className="text-purple-800">
                      {recommendation.result?.cost || '$25 per hectare'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Detailed Analysis */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Soil Analysis
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm font-medium text-gray-700">Soil Health</span>
                    <span className="text-sm font-bold text-green-600">Good</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm font-medium text-gray-700">Nutrient Balance</span>
                    <span className="text-sm font-bold text-yellow-600">Moderate</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm font-medium text-gray-700">Organic Matter</span>
                    <span className="text-sm font-bold text-blue-600">2.5%</span>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900">
                      Application Tips
                    </h4>
                    <ul className="text-sm text-blue-700 mt-1 list-disc list-inside">
                      <li>Apply fertilizer 2-3 weeks before planting</li>
                      <li>Water the soil thoroughly after application</li>
                      <li>Consider soil testing every 6 months</li>
                      <li>Store fertilizer in a cool, dry place</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <Beaker className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Recommendations Yet
              </h3>
              <p className="text-gray-500">
                Fill in the soil parameters and click "Get Recommendations" to see personalized fertilizer suggestions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FertilizerRecommendation;
