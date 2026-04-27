import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Sprout, Wheat, TreePine, Sun, CheckCircle } from 'lucide-react';

const Logout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutComplete, setLogoutComplete] = useState(false);

  useEffect(() => {
    const performLogout = async () => {
      setIsLoggingOut(true);
      
      // Simulate logout process with animation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      logout();
      setLogoutComplete(true);
      setIsLoggingOut(false);
      
      // Redirect to login after showing success message
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    };

    performLogout();
  }, [logout, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-amber-500 to-yellow-600 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 animate-pulse">
          <Sun className="h-16 w-16 text-yellow-200 opacity-60" />
        </div>
        <div className="absolute top-20 right-20 animate-bounce">
          <Wheat className="h-20 w-20 text-orange-200 opacity-60" />
        </div>
        <div className="absolute bottom-20 left-20 animate-pulse">
          <TreePine className="h-24 w-24 text-green-200 opacity-70" />
        </div>
        <div className="absolute bottom-10 right-10 animate-bounce">
          <Sprout className="h-16 w-16 text-yellow-200 opacity-60" />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20 text-center">
            
            {/* Logo */}
            <div className="mb-8">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 transition-all duration-1000 ${
                logoutComplete 
                  ? 'bg-green-500' 
                  : isLoggingOut 
                  ? 'bg-orange-500 animate-pulse' 
                  : 'bg-primary-600'
              }`}>
                {logoutComplete ? (
                  <CheckCircle className="h-10 w-10 text-white animate-bounce" />
                ) : isLoggingOut ? (
                  <LogOut className="h-10 w-10 text-white animate-pulse" />
                ) : (
                  <Sprout className="h-10 w-10 text-white" />
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {logoutComplete ? 'Logged Out Successfully!' : 'Logging Out...'}
              </h1>
              
              <p className="text-gray-600">
                {logoutComplete 
                  ? 'Thank you for using AgriAI Platform. Your farm data is safe and secure.'
                  : 'Securing your session and clearing your data...'
                }
              </p>
            </div>

            {/* Progress Animation */}
            {isLoggingOut && (
              <div className="mb-8">
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div className="bg-gradient-to-r from-orange-500 to-yellow-500 h-3 rounded-full animate-pulse" 
                       style={{ 
                         animation: 'progress 2s ease-in-out forwards',
                         width: '0%'
                       }}>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Cleaning up your farming session...
                </p>
              </div>
            )}

            {/* Success Message */}
            {logoutComplete && (
              <div className="mb-8 space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-green-800 font-medium">All data secured</span>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <p>🌱 Your crop predictions are saved</p>
                  <p>📊 Farm analytics data preserved</p>
                  <p>🔐 Session securely terminated</p>
                </div>
              </div>
            )}

            {/* Redirect Message */}
            <div className="space-y-4">
              {logoutComplete ? (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    Redirecting to login page...
                  </p>
                  <div className="flex justify-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                    <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                  <p className="text-sm text-gray-500">
                    Please wait while we secure your session...
                  </p>
                </div>
              )}
            </div>

            {/* Manual Redirect Link */}
            {logoutComplete && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-3">
                  Not redirected automatically?
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  Go to Login
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-white/80">
              Come back soon to continue your smart farming journey! 🌾
            </p>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default Logout;
