import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Sprout,
  Beaker,
  History,
  TrendingUp,
  Sun,
  Droplets,
  Wind,
  Thermometer,
  BarChart3,
  Users,
  Activity,
  Wheat,
  TreePine,
  CloudRain,
  Flower,
  Tractor,
  MapPin
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  const quickActions = [
    {
      title: 'Crop Prediction',
      description: 'AI-powered crop recommendations based on soil analysis',
      icon: Sprout,
      link: '/predict-crop',
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-gradient-to-br from-green-500 to-emerald-600',
      stats: '95% Accuracy'
    },
    {
      title: 'Fertilizer Recommendation',
      description: 'Personalized nutrient management for optimal growth',
      icon: Beaker,
      link: '/fertilizer',
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-gradient-to-br from-blue-500 to-cyan-600',
      stats: 'Cost Effective'
    },
    {
      title: 'Prediction History',
      description: 'Track your farming decisions and improve results',
      icon: History,
      link: '/history',
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-gradient-to-br from-purple-500 to-pink-600',
      stats: 'Analytics'
    },
  ];

  const stats = [
    {
      title: 'Total Predictions',
      value: '0',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-gradient-to-br from-green-100 to-emerald-100',
      change: '+0%',
      changeType: 'positive'
    },
    {
      title: 'Accuracy Rate',
      value: '0%',
      icon: BarChart3,
      color: 'text-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-100 to-cyan-100',
      change: '+0%',
      changeType: 'positive'
    },
    {
      title: 'Farm Efficiency',
      value: '0%',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-gradient-to-br from-purple-100 to-pink-100',
      change: '+0%',
      changeType: 'positive'
    },
  ];

  const weatherInfo = {
    temperature: 25,
    humidity: 65,
    windSpeed: 12,
    condition: 'Partly Cloudy',
    rainfall: 2,
    uvIndex: 6
  };

  const cropRecommendations = [
    { name: 'Rice', confidence: 92, icon: '🌾', season: 'Monsoon' },
    { name: 'Wheat', confidence: 88, icon: '🌾', season: 'Winter' },
    { name: 'Corn', confidence: 85, icon: '🌽', season: 'Summer' }
  ];

  const farmingTips = [
    {
      icon: Droplets,
      title: 'Optimal Watering',
      description: 'Based on current weather, reduce irrigation by 15%',
      type: 'water'
    },
    {
      icon: Sun,
      title: 'Sunlight Alert',
      description: 'High UV index expected. Consider shade nets',
      type: 'sun'
    },
    {
      icon: CloudRain,
      title: 'Rain Forecast',
      description: 'Light rain expected in 2 days. Plan accordingly',
      type: 'rain'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header with Background */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Welcome back, {user?.name}! 👨‍🌾
              </h1>
              <p className="text-green-100 text-lg">
                Here's your smart farming dashboard for today
              </p>
            </div>
            <div className="hidden lg:flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-green-100">Farm Location</p>
                <p className="font-semibold flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {user?.location || 'Not set'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-green-100">Farm Size</p>
                <p className="font-semibold">
                  {user?.farmSize || '0'} hectares
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                  <div className={`text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                🚀 Quick Actions
              </h2>
              <span className="text-sm text-gray-500">Start your smart farming journey</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={index}
                    to={action.link}
                    className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 block border border-gray-100 hover:border-green-200 transform hover:-translate-y-1"
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`p-4 rounded-xl ${action.bgColor} group-hover:scale-110 transition-transform`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          {action.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            {action.stats}
                          </span>
                          <span className="text-xs text-gray-500 group-hover:text-green-600 transition-colors">
                            Get Started →
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Weather Widget */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                🌤️ Weather
              </h2>
              <span className="text-sm text-gray-500">Real-time data</span>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="text-center mb-6">
                <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4">
                  <Sun className="h-12 w-12 text-white" />
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {weatherInfo.condition}
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {weatherInfo.temperature}°C
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Droplets className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">Humidity</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    {weatherInfo.humidity}%
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Wind className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">Wind Speed</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    {weatherInfo.windSpeed} km/h
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CloudRain className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium text-gray-700">Rainfall</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    {weatherInfo.rainfall} mm
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Crop Recommendations */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              🌾 Recommended Crops
            </h2>
            <Link to="/predict-crop" className="text-sm text-green-600 hover:text-green-700 font-medium">
              View All →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cropRecommendations.map((crop, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{crop.icon}</span>
                    <div>
                      <h3 className="font-bold text-gray-900">{crop.name}</h3>
                      <p className="text-xs text-gray-500">{crop.season} Season</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">{crop.confidence}%</p>
                    <p className="text-xs text-gray-500">Match</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                    style={{ width: `${crop.confidence}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Farming Tips */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              💡 Smart Farming Tips
            </h2>
            <span className="text-sm text-gray-500">AI-powered insights</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {farmingTips.map((tip, index) => {
              const Icon = tip.icon;
              return (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                  <div className="flex items-start space-x-3">
                    <div className={`p-3 rounded-lg ${
                      tip.type === 'water' ? 'bg-blue-100' :
                      tip.type === 'sun' ? 'bg-yellow-100' :
                      'bg-purple-100'
                    }`}>
                      <Icon className={`h-6 w-6 ${
                        tip.type === 'water' ? 'text-blue-600' :
                        tip.type === 'sun' ? 'text-yellow-600' :
                        'text-purple-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {tip.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {tip.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              📊 Recent Activity
            </h2>
            <Link to="/history" className="text-sm text-green-600 hover:text-green-700 font-medium">
              View All →
            </Link>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Activity className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No recent activity
              </h3>
              <p className="text-gray-600 mb-6">
                Start making predictions to see your farming activity here
              </p>
              <div className="flex justify-center space-x-4">
                <Link
                  to="/predict-crop"
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Sprout className="h-4 w-4 mr-2" />
                  Make Prediction
                </Link>
                <Link
                  to="/fertilizer"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Beaker className="h-4 w-4 mr-2" />
                  Get Recommendations
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
