import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.models import load_model
import cv2
import os
from PIL import Image
import json
import pickle
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns

class CropDiseaseDetector:
    def __init__(self):
        self.model = None
        self.label_encoder = LabelEncoder()
        self.class_names = []
        self.image_size = (128, 128)
        self.model_path = "models/disease_detection_model.h5"
        self.encoder_path = "models/disease_label_encoder.pkl"
        
    def create_model(self, num_classes):
        """Create a CNN model for disease detection"""
        model = keras.Sequential([
            # Input layer
            layers.Input(shape=(self.image_size[0], self.image_size[1], 3)),
            
            # Convolutional blocks
            layers.Conv2D(32, (3, 3), activation='relu', padding='same'),
            layers.BatchNormalization(),
            layers.MaxPooling2D((2, 2)),
            layers.Dropout(0.25),
            
            layers.Conv2D(64, (3, 3), activation='relu', padding='same'),
            layers.BatchNormalization(),
            layers.MaxPooling2D((2, 2)),
            layers.Dropout(0.25),
            
            layers.Conv2D(128, (3, 3), activation='relu', padding='same'),
            layers.BatchNormalization(),
            layers.MaxPooling2D((2, 2)),
            layers.Dropout(0.25),
            
            layers.Conv2D(256, (3, 3), activation='relu', padding='same'),
            layers.BatchNormalization(),
            layers.MaxPooling2D((2, 2)),
            layers.Dropout(0.25),
            
            # Flatten and dense layers
            layers.Flatten(),
            layers.Dense(512, activation='relu'),
            layers.BatchNormalization(),
            layers.Dropout(0.5),
            layers.Dense(256, activation='relu'),
            layers.BatchNormalization(),
            layers.Dropout(0.5),
            layers.Dense(num_classes, activation='softmax')
        ])
        
        # Compile model
        model.compile(
            optimizer='adam',
            loss='categorical_crossentropy',
            metrics=['accuracy', 'precision', 'recall']
        )
        
        return model
    
    def preprocess_image(self, image_path):
        """Preprocess image for prediction"""
        try:
            # Load and resize image
            img = Image.open(image_path).convert('RGB')
            img = img.resize(self.image_size)
            
            # Convert to numpy array and normalize
            img_array = np.array(img) / 255.0
            img_array = np.expand_dims(img_array, axis=0)
            
            return img_array
        except Exception as e:
            print(f"Error preprocessing image: {e}")
            return None
    
    def load_and_preprocess_data(self, data_dir):
        """Load and preprocess training data"""
        images = []
        labels = []
        
        # Get class names from directory structure
        self.class_names = sorted(os.listdir(data_dir))
        print(f"Found classes: {self.class_names}")
        
        for class_name in self.class_names:
            class_path = os.path.join(data_dir, class_name)
            if os.path.isdir(class_path):
                for img_name in os.listdir(class_path):
                    if img_name.lower().endswith(('.png', '.jpg', '.jpeg')):
                        img_path = os.path.join(class_path, img_name)
                        
                        # Preprocess image
                        img_array = self.preprocess_image(img_path)
                        if img_array is not None:
                            images.append(img_array[0])
                            labels.append(class_name)
        
        return np.array(images), np.array(labels)
    
    def train_model(self, data_dir, epochs=50, batch_size=32):
        """Train the disease detection model"""
        print("Loading and preprocessing data...")
        X, y = self.load_and_preprocess_data(data_dir)
        
        # Encode labels
        y_encoded = self.label_encoder.fit_transform(y)
        y_categorical = keras.utils.to_categorical(y_encoded)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y_categorical, test_size=0.2, random_state=42, stratify=y_categorical
        )
        
        print(f"Training data shape: {X_train.shape}")
        print(f"Test data shape: {X_test.shape}")
        
        # Create and train model
        num_classes = len(self.class_names)
        self.model = self.create_model(num_classes)
        
        print("Training model...")
        history = self.model.fit(
            X_train, y_train,
            validation_data=(X_test, y_test),
            epochs=epochs,
            batch_size=batch_size,
            callbacks=[
                keras.callbacks.EarlyStopping(patience=10, restore_best_weights=True),
                keras.callbacks.ReduceLROnPlateau(factor=0.2, patience=5)
            ]
        )
        
        # Evaluate model
        print("Evaluating model...")
        y_pred = self.model.predict(X_test)
        y_pred_classes = np.argmax(y_pred, axis=1)
        y_test_classes = np.argmax(y_test, axis=1)
        
        print("\nClassification Report:")
        print(classification_report(y_test_classes, y_pred_classes, 
                                  target_names=self.class_names))
        
        # Save model and encoder
        self.save_model()
        
        # Plot training history
        self.plot_training_history(history)
        
        return history
    
    def predict_disease(self, image_path):
        """Predict disease from image"""
        if self.model is None:
            self.load_model()
        
        # Preprocess image
        img_array = self.preprocess_image(image_path)
        if img_array is None:
            return None
        
        # Make prediction
        predictions = self.model.predict(img_array)
        predicted_class_idx = np.argmax(predictions[0])
        confidence = predictions[0][predicted_class_idx]
        
        # Get class name
        predicted_class = self.label_encoder.inverse_transform([predicted_class_idx])[0]
        
        # Get top 3 predictions
        top_3_idx = np.argsort(predictions[0])[-3:][::-1]
        top_3_predictions = []
        
        for idx in top_3_idx:
            class_name = self.label_encoder.inverse_transform([idx])[0]
            class_confidence = predictions[0][idx]
            top_3_predictions.append({
                'disease': class_name,
                'confidence': float(class_confidence)
            })
        
        return {
            'predicted_disease': predicted_class,
            'confidence': float(confidence),
            'all_predictions': top_3_predictions,
            'is_healthy': 'healthy' in predicted_class.lower(),
            'severity': self._assess_severity(predicted_class, confidence)
        }
    
    def _assess_severity(self, disease_class, confidence):
        """Assess disease severity based on prediction"""
        if 'healthy' in disease_class.lower():
            return 'none'
        elif confidence > 0.8:
            return 'severe'
        elif confidence > 0.6:
            return 'moderate'
        else:
            return 'mild'
    
    def get_treatment_recommendations(self, disease_class):
        """Get treatment recommendations for detected disease"""
        recommendations = {
            'healthy': {
                'action': 'No treatment needed',
                'prevention': [
                    'Continue regular monitoring',
                    'Maintain proper irrigation',
                    'Ensure balanced fertilization',
                    'Practice crop rotation'
                ],
                'monitoring': 'Weekly visual inspection recommended'
            },
            'leaf_blight': {
                'action': 'Apply fungicide immediately',
                'treatment': [
                    'Apply copper-based fungicide',
                    'Remove affected leaves',
                    'Improve air circulation',
                    'Reduce overhead irrigation'
                ],
                'prevention': [
                    'Use resistant varieties',
                    'Ensure proper spacing',
                    'Avoid overwatering'
                ],
                'monitoring': 'Check every 3-4 days'
            },
            'powdery_mildew': {
                'action': 'Apply fungicide spray',
                'treatment': [
                    'Apply sulfur-based fungicide',
                    'Increase air circulation',
                    'Reduce humidity around plants',
                    'Remove infected parts'
                ],
                'prevention': [
                    'Choose resistant varieties',
                    'Maintain proper spacing',
                    'Water at soil level'
                ],
                'monitoring': 'Check every 2-3 days'
            },
            'leaf_spot': {
                'action': 'Apply appropriate fungicide',
                'treatment': [
                    'Apply copper fungicide',
                    'Remove spotted leaves',
                    'Improve drainage',
                    'Avoid overhead watering'
                ],
                'prevention': [
                    'Crop rotation',
                    'Sanitation practices',
                    'Proper plant spacing'
                ],
                'monitoring': 'Check every 3-4 days'
            }
        }
        
        # Default recommendations for unknown diseases
        default_recs = {
            'action': 'Consult agricultural expert',
            'treatment': [
                'Isolate affected plants',
                'Document symptoms with photos',
                'Contact local agricultural extension',
                'Consider preventive measures'
            ],
            'prevention': [
                'Maintain plant health',
                'Practice good sanitation',
                'Monitor regularly'
            ],
            'monitoring': 'Daily monitoring recommended'
        }
        
        return recommendations.get(disease_class.lower(), default_recs)
    
    def save_model(self):
        """Save the trained model and label encoder"""
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        
        # Save model
        self.model.save(self.model_path)
        
        # Save label encoder
        with open(self.encoder_path, 'wb') as f:
            pickle.dump(self.label_encoder, f)
        
        # Save class names
        with open('models/disease_class_names.json', 'w') as f:
            json.dump(self.class_names, f)
        
        print(f"Model saved to {self.model_path}")
    
    def load_model(self):
        """Load the trained model and label encoder"""
        try:
            # Load model
            self.model = load_model(self.model_path)
            
            # Load label encoder
            with open(self.encoder_path, 'rb') as f:
                self.label_encoder = pickle.load(f)
            
            # Load class names
            with open('models/disease_class_names.json', 'r') as f:
                self.class_names = json.load(f)
            
            print(f"Model loaded from {self.model_path}")
            return True
        except Exception as e:
            print(f"Error loading model: {e}")
            return False
    
    def plot_training_history(self, history):
        """Plot training history"""
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4))
        
        # Accuracy plot
        ax1.plot(history.history['accuracy'], label='Training Accuracy')
        ax1.plot(history.history['val_accuracy'], label='Validation Accuracy')
        ax1.set_title('Model Accuracy')
        ax1.set_xlabel('Epoch')
        ax1.set_ylabel('Accuracy')
        ax1.legend()
        
        # Loss plot
        ax2.plot(history.history['loss'], label='Training Loss')
        ax2.plot(history.history['val_loss'], label='Validation Loss')
        ax2.set_title('Model Loss')
        ax2.set_xlabel('Epoch')
        ax2.set_ylabel('Loss')
        ax2.legend()
        
        plt.tight_layout()
        plt.savefig('models/disease_training_history.png')
        plt.close()

# Example usage
if __name__ == "__main__":
    detector = CropDiseaseDetector()
    
    # For training (uncomment when you have data)
    # history = detector.train_model("data/plant_village", epochs=50)
    
    # For prediction
    if detector.load_model():
        result = detector.predict_disease("test_image.jpg")
        if result:
            print(f"Predicted disease: {result['predicted_disease']}")
            print(f"Confidence: {result['confidence']:.2f}")
            print(f"Severity: {result['severity']}")
            
            # Get treatment recommendations
            recommendations = detector.get_treatment_recommendations(result['predicted_disease'])
            print(f"Recommended action: {recommendations['action']}")
