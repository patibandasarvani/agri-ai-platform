@echo off
echo 🌱 Starting Plant Disease Detection System
echo =====================================

echo.
echo 📦 Installing missing dependencies...
echo.

echo Installing ML dependencies...
cd ml-model
pip install flask==2.3.2 flask-cors==4.0.0 tensorflow==2.13.0 pillow==10.0.0 numpy==1.24.3

echo.
echo Installing backend dependencies...
cd ..\backend
npm install pdfkit

echo.
echo Installing frontend dependencies...
cd ..\frontend
npm install react-dropzone react-webcam html2canvas jspdf moment antd

echo.
echo 🚀 Starting services...
echo.

echo Starting Flask ML API (Port 5002)...
start "Flask ML API" cmd /k "cd ..\ml-model && python test_api.py"

timeout /t 3

echo Starting Node.js Backend (Port 5001)...
start "Node.js Backend" cmd /k "cd ..\backend && npm start"

timeout /t 3

echo Starting React Frontend (Port 3000)...
start "React Frontend" cmd /k "cd ..\frontend && npm start"

echo.
echo ✅ All services started!
echo.
echo 📱 Open your browser and go to: http://localhost:3000/plant-disease/upload
echo 🔍 Test endpoints:
echo    Flask API: http://localhost:5002/health
echo    Backend: http://localhost:5001/api/health
echo.
echo Press any key to exit...
pause >nul
