# Plant Disease Detection System Troubleshooting Guide

## 🔍 Quick Diagnosis

### Step 1: Check if Flask API is Working
```bash
cd ml-model
python test_api.py
```

Then test in browser: `http://localhost:5002/health`

### Step 2: Check Node.js Backend
```bash
cd backend
npm start
```

Then test: `http://localhost:5001/api/health`

### Step 3: Check Frontend
```bash
cd frontend
npm start
```

Then access: `http://localhost:3000`

## 🚨 Common Issues & Solutions

### Issue 1: Flask API Not Starting
**Symptoms**: "Address already in use" or import errors

**Solutions**:
```bash
# Kill existing Python processes
taskkill /F /IM python.exe

# Check if port 5002 is free
netstat -ano | findstr :5002

# Install missing dependencies
pip install flask flask-cors tensorflow pillow numpy
```

### Issue 2: TensorFlow Not Loading
**Symptoms**: "DLL load failed" or "No module named tensorflow"

**Solutions**:
```bash
# Install CPU version (more stable)
pip uninstall tensorflow
pip install tensorflow==2.13.0

# Or install CPU-only version
pip install tensorflow-cpu==2.13.0
```

### Issue 3: Backend Connection Error
**Symptoms**: "Failed to get prediction from ML service"

**Solutions**:
1. Make sure Flask API is running on port 5002
2. Check if Flask API health endpoint works: `curl http://localhost:5002/health`
3. Check Node.js backend logs for connection errors

### Issue 4: Frontend Routes Not Working
**Symptoms**: 404 errors when accessing plant disease pages

**Solutions**:
1. Add routes to your main App.js:
```javascript
import PlantDiseaseUpload from './pages/PlantDiseaseUpload';
import PlantDiseaseResult from './pages/PlantDiseaseResult';
import PlantDiseaseHistory from './pages/PlantDiseaseHistory';

// Add to your Router:
<Route path="/plant-disease/upload" element={<PlantDiseaseUpload />} />
<Route path="/plant-disease/result/:predictionId" element={<PlantDiseaseResult />} />
<Route path="/plant-disease/history" element={<PlantDiseaseHistory />} />
```

### Issue 5: Missing Dependencies
**Frontend**:
```bash
cd frontend
npm install react-dropzone react-webcam html2canvas jspdf moment
```

**Backend**:
```bash
cd backend
npm install multer axios pdfkit
```

## 🔧 Step-by-Step Fix Guide

### 1. Start Fresh - Kill All Processes
```bash
# Kill all Node.js processes
taskkill /F /IM node.exe

# Kill all Python processes  
taskkill /F /IM python.exe

# Clear any port conflicts
netstat -ano | findstr :5001
netstat -ano | findstr :5002
```

### 2. Install Dependencies
```bash
# ML Model Dependencies
cd ml-model
pip install flask==2.3.2
pip install flask-cors==4.0.0
pip install tensorflow==2.13.0
pip install pillow==10.0.0
pip install numpy==1.24.3

# Backend Dependencies
cd ../backend
npm install multer@1.4.5-lts.1
npm install axios@1.4.0
npm install pdfkit@0.13.0

# Frontend Dependencies
cd ../frontend
npm install react-dropzone@14.2.3
npm install react-webcam@7.1.1
npm install html2canvas@1.4.1
npm install jspdf@2.5.1
npm install moment@2.29.4
```

### 3. Start Services in Order
```bash
# 1. Start Flask ML API
cd ml-model
python test_api.py
# Should show: "🌱 Starting Plant Disease Detection API"

# 2. Start Node.js Backend (in new terminal)
cd backend
npm start
# Should show: "🚀 Server running on port 5001"

# 3. Start Frontend (in new terminal)
cd frontend
npm start
# Should open browser at http://localhost:3000
```

### 4. Test Each Component
```bash
# Test Flask API
curl http://localhost:5002/health

# Test Backend
curl http://localhost:5001/api/health

# Test Frontend
# Navigate to: http://localhost:3000/plant-disease/upload
```

## 🐛 Debug Mode

### Enable Debug Logging
```bash
# Flask API Debug
cd ml-model
python test_api.py
# This runs in debug mode with detailed logs

# Backend Debug
cd backend
DEBUG=app npm run dev

# Frontend Debug
cd frontend
npm start
# Check browser console for errors
```

### Check Browser Console
1. Open browser (F12)
2. Go to Console tab
3. Look for red error messages
4. Check Network tab for failed requests

## 📱 Test with Simple Image

1. Navigate to `http://localhost:3000/plant-disease/upload`
2. Upload any plant image
3. Click "Detect Disease"
4. Should see results within 5 seconds

## 🆘 If Still Not Working

### Quick Test Script
```bash
# Test complete system
cd ml-model
python -c "
import requests
try:
    response = requests.get('http://localhost:5002/health')
    print('✅ Flask API:', response.json())
except:
    print('❌ Flask API not responding')

try:
    response = requests.get('http://localhost:5001/api/health')
    print('✅ Backend:', response.json())
except:
    print('❌ Backend not responding')
"
```

### Common Port Conflicts
- Flask API: Port 5002
- Node.js Backend: Port 5001  
- Frontend: Port 3000

Change ports if needed:
- Flask: Edit `app.run(port=5003)` in test_api.py
- Backend: Edit `PORT=5002` in .env
- Frontend: Edit `PORT=3001` in package.json

## 📞 Get Help

If you're still stuck, please provide:
1. Exact error message
2. Which component is failing (Flask/Backend/Frontend)
3. Browser console errors
4. Terminal output when starting services

## ✅ Success Checklist

- [ ] Flask API starts without errors
- [ ] Backend starts and shows "Server running on port 5001"
- [ ] Frontend starts and opens browser
- [ ] Can access http://localhost:3000/plant-disease/upload
- [ ] Image upload works
- [ ] Detection shows results
- [ ] History page loads

Follow these steps and the system should work! 🌱
