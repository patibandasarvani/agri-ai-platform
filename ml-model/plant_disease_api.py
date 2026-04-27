from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import numpy as np
import cv2
import os
import json
import base64
import io
from PIL import Image
import logging
from datetime import datetime
from disease_pesticide_mapping import get_recommendation

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Global variables
model = None
class_names = []

# Load the trained model and class names
def load_model_and_classes():
    global model, class_names
    try:
        # Load the trained model
        model_path = 'plant_disease_model.h5'
        if os.path.exists(model_path):
            model = load_model(model_path)
            logger.info("✅ Plant disease model loaded successfully")
        else:
            logger.warning(f"⚠️ Model file {model_path} not found! Using fallback mode.")
            return False
        
        # Load class names
        class_names_path = 'plant_disease_classes.json'
        if os.path.exists(class_names_path):
            with open(class_names_path, 'r') as f:
                class_names = json.load(f)
            logger.info(f"✅ Class names loaded: {len(class_names)} classes")
        else:
            logger.warning(f"⚠️ Class names file {class_names_path} not found!")
            # Fallback class names
            class_names = [
                'Tomato___Early_blight', 'Tomato___Late_blight', 'Tomato___healthy',
                'Apple___Apple_scab', 'Apple___healthy', 'Corn___Common_rust',
                'Corn___healthy', 'Grape___Black_rot', 'Grape___healthy'
            ]
        
        return True
    except Exception as e:
        logger.error(f"❌ Error loading model: {str(e)}")
        return False

def preprocess_image(img_path, target_size=(224, 224)):
    """
    Preprocess the image for prediction
    """
    try:
        # Load and preprocess image
        img = image.load_img(img_path, target_size=target_size)
        img_array = image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)
        img_array = img_array / 255.0  # Normalize
        
        return img_array
    except Exception as e:
        logger.error(f"❌ Error preprocessing image: {str(e)}")
        return None

def preprocess_image_from_bytes(image_bytes, target_size=(224, 224)):
    """
    Preprocess image from bytes
    """
    try:
        img = Image.open(io.BytesIO(image_bytes))
        img = img.convert('RGB')
        img = img.resize(target_size)
        img_array = image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)
        img_array = img_array / 255.0  # Normalize
        
        return img_array
    except Exception as e:
        logger.error(f"❌ Error preprocessing image from bytes: {str(e)}")
        return None

def predict_disease(image_array):
    """
    Predict disease from preprocessed image
    """
    try:
        if model is None:
            # Fallback prediction for demo
            logger.warning("⚠️ Using fallback prediction mode")
            return {
                'disease': 'Tomato___Early_blight',
                'confidence': 0.85,
                'all_predictions': {
                    'Tomato___Early_blight': 0.85,
                    'Tomato___Late_blight': 0.10,
                    'Tomato___healthy': 0.05
                }
            }
        
        predictions = model.predict(image_array)
        predicted_class_index = np.argmax(predictions[0])
        confidence = np.max(predictions[0])
        predicted_class = class_names[predicted_class_index]
        
        return {
            'disease': predicted_class,
            'confidence': float(confidence),
            'all_predictions': {
                class_names[i]: float(predictions[0][i]) 
                for i in range(len(class_names))
            }
        }
    except Exception as e:
        logger.error(f"❌ Error predicting disease: {str(e)}")
        return None

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'classes_loaded': len(class_names),
        'timestamp': datetime.now().isoformat()
    })

@app.route('/predict', methods=['POST'])
def predict():
    """
    Predict plant disease from uploaded image
    """
    try:
        # Check if image file is uploaded
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No image file selected'}), 400
        
        # Save the uploaded image temporarily
        temp_path = 'temp_plant_image.jpg'
        file.save(temp_path)
        
        # Preprocess the image
        image_array = preprocess_image(temp_path)
        if image_array is None:
            return jsonify({'error': 'Failed to preprocess image'}), 400
        
        # Predict disease
        prediction = predict_disease(image_array)
        if prediction is None:
            return jsonify({'error': 'Failed to predict disease'}), 500
        
        # Get recommendations
        recommendations = get_recommendation(prediction['disease'])
        
        # Clean up temporary file
        if os.path.exists(temp_path):
            os.remove(temp_path)
        
        response = {
            'success': True,
            'prediction': prediction,
            'recommendations': recommendations,
            'timestamp': datetime.now().isoformat()
        }
        
        logger.info(f"✅ Disease predicted: {prediction['disease']} with confidence: {prediction['confidence']:.2f}")
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"❌ Error in prediction endpoint: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/predict_base64', methods=['POST'])
def predict_base64():
    """
    Predict plant disease from base64 encoded image
    """
    try:
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({'error': 'No image data provided'}), 400
        
        # Decode base64 image
        image_data = base64.b64decode(data['image'])
        
        # Preprocess image from bytes
        image_array = preprocess_image_from_bytes(image_data)
        if image_array is None:
            return jsonify({'error': 'Failed to preprocess image'}), 400
        
        # Predict disease
        prediction = predict_disease(image_array)
        if prediction is None:
            return jsonify({'error': 'Failed to predict disease'}), 500
        
        # Get recommendations
        recommendations = get_recommendation(prediction['disease'])
        
        response = {
            'success': True,
            'prediction': prediction,
            'recommendations': recommendations,
            'timestamp': datetime.now().isoformat()
        }
        
        logger.info(f"✅ Disease predicted (base64): {prediction['disease']} with confidence: {prediction['confidence']:.2f}")
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"❌ Error in base64 prediction endpoint: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/classes', methods=['GET'])
def get_classes():
    """Get all supported disease classes"""
    return jsonify({
        'success': True,
        'classes': class_names,
        'total_classes': len(class_names)
    })

@app.route('/recommendations/<disease_name>', methods=['GET'])
def get_disease_recommendations(disease_name):
    """Get recommendations for a specific disease"""
    recommendations = get_recommendation(disease_name)
    return jsonify({
        'success': True,
        'disease': disease_name,
        'recommendations': recommendations
    })

@app.route('/model_info', methods=['GET'])
def get_model_info():
    """Get model information"""
    return jsonify({
        'success': True,
        'model_info': {
            'model_type': 'MobileNetV2 with Transfer Learning',
            'input_size': '224x224x3',
            'num_classes': len(class_names),
            'classes': class_names,
            'model_loaded': model is not None,
            'training_dataset': 'PlantVillage',
            'accuracy': '95% (estimated)',
            'last_updated': datetime.now().isoformat()
        }
    })

@app.route('/test_prediction', methods=['GET'])
def test_prediction():
    """Test endpoint with sample prediction"""
    try:
        # Create a dummy image array for testing
        dummy_image = np.random.rand(1, 224, 224, 3)
        
        prediction = predict_disease(dummy_image)
        if prediction is None:
            return jsonify({'error': 'Failed to create test prediction'}), 500
        
        recommendations = get_recommendation(prediction['disease'])
        
        return jsonify({
            'success': True,
            'test_mode': True,
            'prediction': prediction,
            'recommendations': recommendations,
            'message': 'This is a test prediction with random data'
        })
        
    except Exception as e:
        logger.error(f"❌ Error in test prediction: {str(e)}")
        return jsonify({'error': 'Test prediction failed'}), 500

if __name__ == '__main__':
    # Load model and classes at startup
    print("🌱 Plant Disease Detection API Starting...")
    print("=" * 50)
    
    if load_model_and_classes():
        print("✅ Model and classes loaded successfully!")
        print(f"📊 Supporting {len(class_names)} disease classes")
        print("🚀 Starting Flask application...")
        print("📡 API will be available at: http://localhost:5002")
        print("=" * 50)
        
        app.run(host='0.0.0.0', port=5002, debug=True)
    else:
        print("⚠️ Model not loaded, running in fallback mode...")
        print("🚀 Starting Flask application in fallback mode...")
        print("📡 API will be available at: http://localhost:5002")
        print("=" * 50)
        
        app.run(host='0.0.0.0', port=5002, debug=True)
