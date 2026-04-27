from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Test data
TEST_RECOMMENDATIONS = {
    'Tomato___Early_blight': {
        'pesticide': 'Mancozeb',
        'usage': 'Spray 2g per liter of water',
        'application_method': 'Foliar spray',
        'safety_tips': 'Wear gloves and mask while spraying',
        'prevention': ['Remove infected leaves', 'Improve air circulation'],
        'soil_management': ['Maintain soil pH between 6.0-6.5'],
        'water_management': ['Water at the base of plants'],
        'fertilizer_suggestion': 'Use balanced NPK fertilizer'
    }
}

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'message': 'Plant Disease API is running',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Check if image file is uploaded
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No image file selected'}), 400
        
        # Simulate prediction (replace with actual ML prediction)
        prediction = {
            'disease': 'Tomato___Early_blight',
            'confidence': 0.85,
            'all_predictions': {
                'Tomato___Early_blight': 0.85,
                'Tomato___Late_blight': 0.10,
                'Tomato___healthy': 0.05
            }
        }
        
        # Get recommendations
        recommendations = TEST_RECOMMENDATIONS.get(prediction['disease'], {
            'pesticide': 'Consult expert',
            'usage': 'Professional assessment required',
            'application_method': 'Expert consultation',
            'safety_tips': 'Seek professional advice',
            'prevention': ['Consult local agricultural extension'],
            'soil_management': ['Maintain soil health'],
            'water_management': ['Proper irrigation'],
            'fertilizer_suggestion': 'Consult agricultural expert'
        })
        
        response = {
            'success': True,
            'prediction': prediction,
            'recommendations': recommendations,
            'timestamp': datetime.now().isoformat()
        }
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@app.route('/predict_base64', methods=['POST'])
def predict_base64():
    try:
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({'error': 'No image data provided'}), 400
        
        # Simulate prediction
        prediction = {
            'disease': 'Tomato___Early_blight',
            'confidence': 0.85,
            'all_predictions': {
                'Tomato___Early_blight': 0.85,
                'Tomato___Late_blight': 0.10,
                'Tomato___healthy': 0.05
            }
        }
        
        recommendations = TEST_RECOMMENDATIONS.get(prediction['disease'], {
            'pesticide': 'Consult expert',
            'usage': 'Professional assessment required'
        })
        
        response = {
            'success': True,
            'prediction': prediction,
            'recommendations': recommendations,
            'timestamp': datetime.now().isoformat()
        }
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

if __name__ == '__main__':
    print("🌱 Starting Plant Disease Detection API (Test Version)...")
    print("📡 API will be available at: http://localhost:5002")
    print("🔍 Test endpoints:")
    print("   GET  http://localhost:5002/health")
    print("   POST http://localhost:5002/predict")
    print("   POST http://localhost:5002/predict_base64")
    print("=" * 50)
    
    app.run(host='0.0.0.0', port=5002, debug=True)
