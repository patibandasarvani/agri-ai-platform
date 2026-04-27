import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';

// Context
import { AuthProvider } from './contexts/AuthContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CropPrediction from './pages/CropPrediction';
import FertilizerRecommendation from './pages/FertilizerRecommendation';
import History from './pages/History';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
import Logout from './pages/Logout';
import NotFound from './pages/NotFound';

// Plant Disease Detection Pages
import PlantDiseaseUpload from './pages/PlantDiseaseUpload';
import PlantDiseaseResult from './pages/PlantDiseaseResult';
import PlantDiseaseHistory from './pages/PlantDiseaseHistory';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            
            <main className="flex-1">
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected routes */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <Navigate to="/dashboard" replace />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/predict-crop" element={
                  <ProtectedRoute>
                    <CropPrediction />
                  </ProtectedRoute>
                } />
                <Route path="/fertilizer" element={
                  <ProtectedRoute>
                    <FertilizerRecommendation />
                  </ProtectedRoute>
                } />
                <Route path="/history" element={
                  <ProtectedRoute>
                    <History />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                
                {/* Plant Disease Detection Routes */}
                <Route path="/plant-disease/upload" element={
                  <ProtectedRoute>
                    <PlantDiseaseUpload />
                  </ProtectedRoute>
                } />
                <Route path="/plant-disease/result/:predictionId" element={
                  <ProtectedRoute>
                    <PlantDiseaseResult />
                  </ProtectedRoute>
                } />
                <Route path="/plant-disease/history" element={
                  <ProtectedRoute>
                    <PlantDiseaseHistory />
                  </ProtectedRoute>
                } />
                
                {/* Logout route */}
                <Route path="/logout" element={
                  <ProtectedRoute>
                    <Logout />
                  </ProtectedRoute>
                } />
                
                {/* Admin routes */}
                <Route path="/admin" element={
                  <AdminRoute>
                    <AdminPanel />
                  </AdminRoute>
                } />
                
                {/* 404 route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
          
          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
