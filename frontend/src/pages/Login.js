import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Sprout, Mail, Lock, Wheat, TreePine, Sun } from 'lucide-react';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    const result = await login(data.email, data.password);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 animate-pulse">
          <Wheat className="h-16 w-16 text-yellow-300 opacity-60" />
        </div>
        <div className="absolute top-20 right-20 animate-bounce">
          <TreePine className="h-20 w-20 text-green-300 opacity-60" />
        </div>
        <div className="absolute bottom-20 left-20 animate-pulse">
          <Sun className="h-24 w-24 text-yellow-200 opacity-70" />
        </div>
        <div className="absolute bottom-10 right-10 animate-bounce">
          <Sprout className="h-16 w-16 text-green-200 opacity-60" />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl w-full flex flex-col lg:flex-row items-center gap-12">
          
          {/* Left Side - Agriculture Illustration */}
          <div className="flex-1 text-white hidden lg:block">
            <div className="text-center">
              <div className="mb-8">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full mb-6">
                  <Sprout className="h-12 w-12 text-white" />
                </div>
                <h1 className="text-5xl font-bold mb-4">
                  AgriAI Platform
                </h1>
                <p className="text-xl text-white/90 leading-relaxed">
                  Transform your farming with AI-powered crop predictions and 
                  intelligent fertilizer recommendations for maximum yield.
                </p>
              </div>
              
              {/* Feature Cards */}
              <div className="space-y-4 text-left max-w-md mx-auto">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                      <Wheat className="h-5 w-5 text-yellow-900" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Smart Crop Prediction</h3>
                      <p className="text-sm text-white/80">AI-powered recommendations based on soil analysis</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-400 rounded-full flex items-center justify-center">
                      <TreePine className="h-5 w-5 text-green-900" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Fertilizer Intelligence</h3>
                      <p className="text-sm text-white/80">Optimized nutrient management for your crops</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-400 rounded-full flex items-center justify-center">
                      <Sun className="h-5 w-5 text-orange-900" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Weather Integration</h3>
                      <p className="text-sm text-white/80">Real-time weather data for better decisions</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="flex-1 max-w-md w-full">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
              {/* Mobile Header */}
              <div className="text-center lg:hidden mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4">
                  <Sprout className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">
                  AgriAI Platform
                </h1>
              </div>

              {/* Desktop Header */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome Back! 👨‍🌾
                </h2>
                <p className="text-gray-600">
                  Sign in to access your smart farming dashboard
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^\S+@\S+$/i,
                          message: 'Invalid email address',
                        },
                      })}
                      className={`appearance-none block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                        errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="farmer@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <span className="mr-1">⚠️</span>
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      {...register('password', {
                        required: 'Password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters',
                        },
                      })}
                      className={`appearance-none block w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                        errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <span className="mr-1">⚠️</span>
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                      Remember me
                    </label>
                  </div>
                  <div className="text-sm">
                    <a href="#" className="font-medium text-green-600 hover:text-green-500">
                      Forgot password?
                    </a>
                  </div>
                </div>

                {/* Submit Button */}
                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Signing in...
                      </>
                    ) : (
                      <>
                        <Sprout className="h-4 w-4 mr-2" />
                        Sign in to Dashboard
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Demo Account */}
              <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div className="flex items-start space-x-2">
                  <span className="text-green-600 text-lg">💡</span>
                  <div>
                    <p className="text-sm text-gray-700 font-medium">Demo Account Available</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Use any email and password (minimum 6 characters) to test the platform
                    </p>
                  </div>
                </div>
              </div>

              {/* Register Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    className="font-medium text-green-600 hover:text-green-500 transition-colors"
                  >
                    Sign up for free
                  </Link>
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-xs text-white/80">
                By signing in, you agree to our{' '}
                <a href="#" className="text-white hover:text-white/100 underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-white hover:text-white/100 underline">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
