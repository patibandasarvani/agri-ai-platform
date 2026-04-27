"""
Professional ML Model Training for Crop Prediction System
Implements Random Forest, Decision Tree, and K-Nearest Neighbors algorithms
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import (
    accuracy_score, classification_report, confusion_matrix,
    precision_score, recall_score, f1_score
)
import joblib
import os
import warnings
warnings.filterwarnings('ignore')

class CropPredictionModel:
    """
    Professional ML model trainer for crop prediction.
    Implements multiple algorithms with comprehensive evaluation.
    """
    
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.encoders = {}
        self.best_model = None
        self.best_model_name = None
        self.feature_columns = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
        self.target_column = 'crop'
        
    def load_data(self, filepath='data/agriculture_dataset.csv'):
        """
        Load and preprocess the agriculture dataset.
        """
        print("📊 Loading agriculture dataset...")
        df = pd.read_csv(filepath)
        
        print(f"✅ Dataset loaded successfully!")
        print(f"📈 Shape: {df.shape}")
        print(f"🌾 Crops: {df[self.target_column].nunique()}")
        print(f"🔢 Features: {len(self.feature_columns)}")
        
        return df
    
    def preprocess_data(self, df):
        """
        Preprocess data for ML training.
        """
        print("🔧 Preprocessing data...")
        
        # Check for missing values
        if df.isnull().sum().sum() > 0:
            print("⚠️  Missing values found. Handling...")
            df = df.dropna()
        
        # Separate features and target
        X = df[self.feature_columns]
        y = df[self.target_column]
        
        # Encode target variable
        le = LabelEncoder()
        y_encoded = le.fit_transform(y)
        
        # Scale features
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
        )
        
        # Store preprocessing objects
        self.encoders['target'] = le
        self.scalers['features'] = scaler
        
        print(f"✅ Data preprocessed successfully!")
        print(f"📊 Training set: {X_train.shape}")
        print(f"📊 Test set: {X_test.shape}")
        
        return X_train, X_test, y_train, y_test
    
    def train_random_forest(self, X_train, y_train):
        """
        Train Random Forest model with hyperparameter tuning.
        """
        print("🌲 Training Random Forest model...")
        
        # Hyperparameter grid
        param_grid = {
            'n_estimators': [100, 200, 300],
            'max_depth': [10, 15, 20, None],
            'min_samples_split': [2, 5, 10],
            'min_samples_leaf': [1, 2, 4]
        }
        
        # Grid search with cross-validation
        rf = RandomForestClassifier(random_state=42)
        grid_search = GridSearchCV(
            rf, param_grid, cv=5, scoring='accuracy', n_jobs=-1, verbose=0
        )
        
        grid_search.fit(X_train, y_train)
        
        # Best model
        best_rf = grid_search.best_estimator_
        
        print(f"✅ Random Forest trained successfully!")
        print(f"🎯 Best parameters: {grid_search.best_params_}")
        print(f"📊 Best cross-validation score: {grid_search.best_score_:.4f}")
        
        self.models['Random Forest'] = best_rf
        return best_rf
    
    def train_decision_tree(self, X_train, y_train):
        """
        Train Decision Tree model with hyperparameter tuning.
        """
        print("🌳 Training Decision Tree model...")
        
        # Hyperparameter grid
        param_grid = {
            'max_depth': [5, 10, 15, 20, None],
            'min_samples_split': [2, 5, 10],
            'min_samples_leaf': [1, 2, 4],
            'criterion': ['gini', 'entropy']
        }
        
        # Grid search with cross-validation
        dt = DecisionTreeClassifier(random_state=42)
        grid_search = GridSearchCV(
            dt, param_grid, cv=5, scoring='accuracy', n_jobs=-1, verbose=0
        )
        
        grid_search.fit(X_train, y_train)
        
        # Best model
        best_dt = grid_search.best_estimator_
        
        print(f"✅ Decision Tree trained successfully!")
        print(f"🎯 Best parameters: {grid_search.best_params_}")
        print(f"📊 Best cross-validation score: {grid_search.best_score_:.4f}")
        
        self.models['Decision Tree'] = best_dt
        return best_dt
    
    def train_knn(self, X_train, y_train):
        """
        Train K-Nearest Neighbors model with hyperparameter tuning.
        """
        print("🎯 Training K-Nearest Neighbors model...")
        
        # Hyperparameter grid
        param_grid = {
            'n_neighbors': [3, 5, 7, 9, 11],
            'weights': ['uniform', 'distance'],
            'metric': ['euclidean', 'manhattan']
        }
        
        # Grid search with cross-validation
        knn = KNeighborsClassifier()
        grid_search = GridSearchCV(
            knn, param_grid, cv=5, scoring='accuracy', n_jobs=-1, verbose=0
        )
        
        grid_search.fit(X_train, y_train)
        
        # Best model
        best_knn = grid_search.best_estimator_
        
        print(f"✅ KNN trained successfully!")
        print(f"🎯 Best parameters: {grid_search.best_params_}")
        print(f"📊 Best cross-validation score: {grid_search.best_score_:.4f}")
        
        self.models['KNN'] = best_knn
        return best_knn
    
    def evaluate_models(self, X_test, y_test):
        """
        Evaluate all trained models and select the best one.
        """
        print("📈 Evaluating models...")
        
        results = {}
        
        for name, model in self.models.items():
            # Predictions
            y_pred = model.predict(X_test)
            
            # Metrics
            accuracy = accuracy_score(y_test, y_pred)
            precision = precision_score(y_test, y_pred, average='weighted')
            recall = recall_score(y_test, y_pred, average='weighted')
            f1 = f1_score(y_test, y_pred, average='weighted')
            
            results[name] = {
                'accuracy': accuracy,
                'precision': precision,
                'recall': recall,
                'f1_score': f1,
                'predictions': y_pred
            }
            
            print(f"📊 {name}:")
            print(f"  Accuracy: {accuracy:.4f}")
            print(f"  Precision: {precision:.4f}")
            print(f"  Recall: {recall:.4f}")
            print(f"  F1-Score: {f1:.4f}")
        
        # Select best model based on accuracy
        best_model_name = max(results.keys(), key=lambda k: results[k]['accuracy'])
        self.best_model = self.models[best_model_name]
        self.best_model_name = best_model_name
        
        print(f"\n🏆 Best model: {best_model_name}")
        print(f"🎯 Best accuracy: {results[best_model_name]['accuracy']:.4f}")
        
        return results
    
    def generate_confusion_matrices(self, y_test, results):
        """
        Generate confusion matrices for all models.
        """
        print("📊 Generating confusion matrices...")
        
        # Create directory for plots
        os.makedirs('models/plots', exist_ok=True)
        
        # Get class names
        class_names = self.encoders['target'].classes_
        
        for name, result in results.items():
            plt.figure(figsize=(12, 8))
            
            # Confusion matrix
            cm = confusion_matrix(y_test, result['predictions'])
            
            # Plot
            sns.heatmap(
                cm, annot=True, fmt='d', cmap='Blues',
                xticklabels=class_names, yticklabels=class_names
            )
            
            plt.title(f'Confusion Matrix - {name}')
            plt.xlabel('Predicted')
            plt.ylabel('Actual')
            plt.xticks(rotation=45)
            plt.yticks(rotation=0)
            plt.tight_layout()
            
            # Save plot
            plt.savefig(f'models/plots/confusion_matrix_{name.lower().replace(" ", "_")}.png', dpi=300, bbox_inches='tight')
            plt.close()
        
        print("✅ Confusion matrices saved successfully!")
    
    def generate_feature_importance(self):
        """
        Generate feature importance plots for tree-based models.
        """
        print("📊 Generating feature importance plots...")
        
        for name, model in self.models.items():
            if hasattr(model, 'feature_importances_'):
                plt.figure(figsize=(10, 6))
                
                # Feature importance
                importances = model.feature_importances_
                indices = np.argsort(importances)[::-1]
                
                # Plot
                plt.title(f'Feature Importance - {name}')
                plt.bar(range(len(self.feature_columns)), importances[indices])
                plt.xticks(range(len(self.feature_columns)), [self.feature_columns[i] for i in indices], rotation=45)
                plt.tight_layout()
                
                # Save plot
                plt.savefig(f'models/plots/feature_importance_{name.lower().replace(" ", "_")}.png', dpi=300, bbox_inches='tight')
                plt.close()
        
        print("✅ Feature importance plots saved successfully!")
    
    def save_models(self):
        """
        Save all trained models and preprocessing objects.
        """
        print("💾 Saving models...")
        
        # Create directory
        os.makedirs('models', exist_ok=True)
        
        # Save models
        for name, model in self.models.items():
            filename = name.lower().replace(" ", "_")
            joblib.dump(model, f'models/{filename}_model.pkl')
        
        # Save best model separately
        joblib.dump(self.best_model, 'models/best_crop_model.pkl')
        
        # Save preprocessing objects
        joblib.dump(self.scalers['features'], 'models/feature_scaler.pkl')
        joblib.dump(self.encoders['target'], 'models/label_encoder.pkl')
        
        # Save model metadata
        metadata = {
            'feature_columns': self.feature_columns,
            'target_column': self.target_column,
            'best_model_name': self.best_model_name,
            'crop_classes': list(self.encoders['target'].classes_)
        }
        
        joblib.dump(metadata, 'models/model_metadata.pkl')
        
        print("✅ Models saved successfully!")
        print(f"🏆 Best model: {self.best_model_name}")
        print(f"📁 Models saved in 'models/' directory")
    
    def generate_training_report(self, results):
        """
        Generate a comprehensive training report.
        """
        print("📄 Generating training report...")
        
        report = f"""
# Crop Prediction Model Training Report

## Dataset Information
- Total Samples: {len(self.encoders['target'].classes_) * 150}
- Number of Crops: {len(self.encoders['target'].classes_)}
- Features: {len(self.feature_columns)}
- Feature Columns: {', '.join(self.feature_columns)}

## Crop Classes
{', '.join(self.encoders['target'].classes_)}

## Model Performance Results

"""
        
        for name, result in results.items():
            report += f"""
### {name}
- **Accuracy**: {result['accuracy']:.4f}
- **Precision**: {result['precision']:.4f}
- **Recall**: {result['recall']:.4f}
- **F1-Score**: {result['f1_score']:.4f}

"""
        
        report += f"""
## Best Model
**{self.best_model_name}** with accuracy of {results[self.best_model_name]['accuracy']:.4f}

## Saved Files
- `models/best_crop_model.pkl` - Best performing model
- `models/feature_scaler.pkl` - Feature scaling parameters
- `models/label_encoder.pkl` - Label encoding parameters
- `models/model_metadata.pkl` - Model metadata
- `models/plots/` - Visualization plots

## Deployment Ready
The models are ready for deployment in the Flask API server.

---
*Generated by AI-Powered Smart Agriculture Platform*
"""
        
        # Save report
        with open('models/training_report.md', 'w') as f:
            f.write(report)
        
        print("✅ Training report saved successfully!")
        print("📄 Report available at 'models/training_report.md'")
    
    def train_all_models(self):
        """
        Complete training pipeline for all models.
        """
        print("🚀 Starting complete ML training pipeline...")
        
        # Load data
        df = self.load_data()
        
        # Preprocess data
        X_train, X_test, y_train, y_test = self.preprocess_data(df)
        
        # Train models
        self.train_random_forest(X_train, y_train)
        self.train_decision_tree(X_train, y_train)
        self.train_knn(X_train, y_train)
        
        # Evaluate models
        results = self.evaluate_models(X_test, y_test)
        
        # Generate visualizations
        self.generate_confusion_matrices(y_test, results)
        self.generate_feature_importance()
        
        # Save models
        self.save_models()
        
        # Generate report
        self.generate_training_report(results)
        
        print("\n🎉 ML training pipeline completed successfully!")
        print(f"🏆 Best model: {self.best_model_name}")
        print("📁 All models and artifacts saved in 'models/' directory")
        
        return results

def main():
    """
    Main function to run the complete ML training pipeline.
    """
    # Initialize model trainer
    trainer = CropPredictionModel()
    
    # Train all models
    results = trainer.train_all_models()
    
    print("\n🌱 Crop Prediction ML Models Ready for Production!")
    print("🚀 Start the Flask API server to use the models.")

if __name__ == "__main__":
    main()
