import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
import json
from datetime import datetime, timedelta
import random

class SmartIrrigationSystem:
    def __init__(self):
        self.irrigation_model = None
        self.moisture_predictor = None
        self.scaler = StandardScaler()
        self.crop_encoder = LabelEncoder()
        self.soil_encoder = LabelEncoder()
        self.crop_types = []
        self.soil_types = []
        
    def generate_training_data(self, n_samples=10000):
        """Generate synthetic training data for irrigation system"""
        print("🔄 Generating synthetic irrigation training data...")
        
        # Crop types and their water requirements
        crops = ['Rice', 'Wheat', 'Corn', 'Soybean', 'Cotton', 'Sugarcane', 'Tomato', 'Potato']
        soil_types = ['Clay', 'Loam', 'Sandy', 'Silt', 'Peat']
        
        data = []
        for i in range(n_samples):
            # Random crop and soil
            crop = random.choice(crops)
            soil_type = random.choice(soil_types)
            
            # Environmental factors
            temperature = random.uniform(15, 45)  # Celsius
            humidity = random.uniform(20, 95)     # Percentage
            rainfall = random.uniform(0, 50)      # mm per day
            wind_speed = random.uniform(0, 25)    # km/h
            solar_radiation = random.uniform(100, 1000)  # W/m²
            
            # Soil conditions
            current_moisture = random.uniform(10, 90)  # Percentage
            ph = random.uniform(4.5, 8.5)
            organic_matter = random.uniform(0.5, 5.0)   # Percentage
            
            # Crop growth stage (0-1, where 1 is mature)
            growth_stage = random.uniform(0, 1)
            
            # Field characteristics
            area_hectares = random.uniform(0.5, 10)
            field_slope = random.uniform(0, 15)  # degrees
            
            # Calculate irrigation requirement based on factors
            base_requirement = {
                'Rice': 8.0, 'Wheat': 4.5, 'Corn': 6.0, 'Soybean': 5.0,
                'Cotton': 5.5, 'Sugarcane': 7.0, 'Tomato': 4.0, 'Potato': 3.5
            }
            
            # Soil water holding capacity adjustment
            soil_factor = {
                'Clay': 0.8, 'Loam': 1.0, 'Sandy': 1.3,
                'Silt': 0.9, 'Peat': 0.7
            }
            
            # Calculate irrigation need
            crop_factor = base_requirement[crop]
            soil_adjustment = soil_factor[soil_type]
            
            # Temperature and humidity adjustment
            et_adjustment = (temperature / 25) * (100 - humidity) / 100
            
            # Growth stage adjustment (more water during critical growth stages)
            growth_adjustment = 0.7 + 0.6 * growth_stage
            
            # Calculate final irrigation requirement (mm/day)
            irrigation_requirement = (
                crop_factor * soil_adjustment * et_adjustment * growth_adjustment - rainfall * 0.7
            )
            
            # Ensure non-negative values
            irrigation_requirement = max(0, irrigation_requirement)
            
            # Add some noise
            irrigation_requirement += random.gauss(0, 0.5)
            irrigation_requirement = max(0, irrigation_requirement)
            
            data.append({
                'crop_type': crop,
                'soil_type': soil_type,
                'temperature': temperature,
                'humidity': humidity,
                'rainfall': rainfall,
                'wind_speed': wind_speed,
                'solar_radiation': solar_radiation,
                'current_moisture': current_moisture,
                'ph': ph,
                'organic_matter': organic_matter,
                'growth_stage': growth_stage,
                'area_hectares': area_hectares,
                'field_slope': field_slope,
                'irrigation_requirement': irrigation_requirement
            })
        
        return pd.DataFrame(data)
    
    def train_models(self, data_path=None):
        """Train the irrigation prediction models"""
        if data_path:
            df = pd.read_csv(data_path)
        else:
            df = self.generate_training_data()
        
        print(f"📊 Training with {len(df)} samples...")
        
        # Prepare features
        feature_columns = [
            'crop_type', 'soil_type', 'temperature', 'humidity', 'rainfall',
            'wind_speed', 'solar_radiation', 'current_moisture', 'ph',
            'organic_matter', 'growth_stage', 'area_hectares', 'field_slope'
        ]
        
        X = df[feature_columns].copy()
        y_irrigation = df['irrigation_requirement']
        
        # Encode categorical variables
        X['crop_type_encoded'] = self.crop_encoder.fit_transform(X['crop_type'])
        X['soil_type_encoded'] = self.soil_encoder.fit_transform(X['soil_type'])
        
        # Store encoders
        self.crop_types = list(self.crop_encoder.classes_)
        self.soil_types = list(self.soil_encoder.classes_)
        
        # Prepare final features
        final_features = [
            'crop_type_encoded', 'soil_type_encoded', 'temperature', 'humidity',
            'rainfall', 'wind_speed', 'solar_radiation', 'current_moisture',
            'ph', 'organic_matter', 'growth_stage', 'area_hectares', 'field_slope'
        ]
        
        X_final = X[final_features]
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X_final)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y_irrigation, test_size=0.2, random_state=42
        )
        
        # Train irrigation prediction model
        print("🌱 Training irrigation requirement model...")
        self.irrigation_model = GradientBoostingRegressor(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=6,
            random_state=42
        )
        
        self.irrigation_model.fit(X_train, y_train)
        
        # Train moisture prediction model
        print("💧 Training moisture prediction model...")
        self.moisture_predictor = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        
        # Create target for moisture prediction (next day moisture)
        moisture_features = [
            'crop_type_encoded', 'soil_type_encoded', 'temperature', 'humidity',
            'current_moisture', 'rainfall', 'irrigation_requirement'
        ]
        
        X_moisture = X[moisture_features]
        y_next_moisture = X['current_moisture'] + (y_irrigation * 0.1) - (X['rainfall'] * 0.05)
        y_next_moisture = np.clip(y_next_moisture, 0, 100)
        
        X_moisture_scaled = self.scaler.fit_transform(X_moisture)
        
        X_train_m, X_test_m, y_train_m, y_test_m = train_test_split(
            X_moisture_scaled, y_next_moisture, test_size=0.2, random_state=42
        )
        
        self.moisture_predictor.fit(X_train_m, y_train_m)
        
        # Evaluate models
        irrigation_pred = self.irrigation_model.predict(X_test)
        moisture_pred = self.moisture_predictor.predict(X_test_m)
        
        irrigation_mae = mean_absolute_error(y_test, irrigation_pred)
        irrigation_r2 = r2_score(y_test, irrigation_pred)
        
        moisture_mae = mean_absolute_error(y_test_m, moisture_pred)
        moisture_r2 = r2_score(y_test_m, moisture_pred)
        
        print(f"✅ Irrigation Model - MAE: {irrigation_mae:.2f}, R²: {irrigation_r2:.3f}")
        print(f"✅ Moisture Model - MAE: {moisture_mae:.2f}, R²: {moisture_r2:.3f}")
        
        return {
            'irrigation_mae': irrigation_mae,
            'irrigation_r2': irrigation_r2,
            'moisture_mae': moisture_mae,
            'moisture_r2': moisture_r2
        }
    
    def predict_irrigation(self, input_data):
        """Predict irrigation requirements"""
        if not self.irrigation_model:
            raise ValueError("Model not trained. Call train_models() first.")
        
        # Convert input to DataFrame
        if isinstance(input_data, dict):
            input_data = [input_data]
        
        df = pd.DataFrame(input_data)
        
        # Encode categorical variables
        df['crop_type_encoded'] = self.crop_encoder.transform(df['crop_type'])
        df['soil_type_encoded'] = self.soil_encoder.transform(df['soil_type'])
        
        # Prepare features
        feature_columns = [
            'crop_type_encoded', 'soil_type_encoded', 'temperature', 'humidity',
            'rainfall', 'wind_speed', 'solar_radiation', 'current_moisture',
            'ph', 'organic_matter', 'growth_stage', 'area_hectares', 'field_slope'
        ]
        
        X = df[feature_columns]
        X_scaled = self.scaler.transform(X)
        
        # Make predictions
        irrigation_pred = self.irrigation_model.predict(X_scaled)
        
        # Ensure non-negative values
        irrigation_pred = np.maximum(irrigation_pred, 0)
        
        results = []
        for i, pred in enumerate(irrigation_pred):
            result = {
                'irrigation_requirement_mm': round(pred, 2),
                'irrigation_liters_per_hectare': round(pred * 10000, 0),  # 1mm = 10,000 liters per hectare
                'total_liters': round(pred * 10000 * df.iloc[i]['area_hectares'], 0),
                'input_data': input_data[i]
            }
            results.append(result)
        
        return results
    
    def predict_moisture_trend(self, input_data, days=7):
        """Predict soil moisture trend for next few days"""
        if not self.moisture_predictor:
            raise ValueError("Model not trained. Call train_models() first.")
        
        # Convert input to DataFrame
        if isinstance(input_data, dict):
            input_data = [input_data]
        
        df = pd.DataFrame(input_data)
        
        # Encode categorical variables
        df['crop_type_encoded'] = self.crop_encoder.transform(df['crop_type'])
        df['soil_type_encoded'] = self.soil_encoder.transform(df['soil_type'])
        
        # Get initial irrigation prediction
        irrigation_results = self.predict_irrigation(input_data)
        
        moisture_trends = []
        
        for i, row in df.iterrows():
            current_moisture = row['current_moisture']
            trend = [current_moisture]
            
            # Predict for each day
            for day in range(days):
                # Prepare input for moisture prediction
                moisture_input = {
                    'crop_type_encoded': row['crop_type_encoded'],
                    'soil_type_encoded': row['soil_type_encoded'],
                    'temperature': row['temperature'],
                    'humidity': row['humidity'],
                    'current_moisture': trend[-1],
                    'rainfall': row['rainfall'],
                    'irrigation_requirement': irrigation_results[i]['irrigation_requirement_mm']
                }
                
                # Scale input
                moisture_df = pd.DataFrame([moisture_input])
                moisture_scaled = self.scaler.transform(moisture_df)
                
                # Predict next day moisture
                next_moisture = self.moisture_predictor.predict(moisture_scaled)[0]
                next_moisture = np.clip(next_moisture, 0, 100)
                trend.append(round(next_moisture, 1))
            
            moisture_trends.append(trend)
        
        return moisture_trends
    
    def generate_irrigation_schedule(self, input_data, days=7):
        """Generate optimized irrigation schedule"""
        irrigation_results = self.predict_irrigation(input_data)
        moisture_trends = self.predict_moisture_trend(input_data, days)
        
        schedules = []
        
        for i, (irrigation_result, moisture_trend) in enumerate(zip(irrigation_results, moisture_trends)):
            schedule = []
            current_moisture = moisture_trend[0]
            
            for day in range(days):
                day_moisture = moisture_trend[day + 1]
                
                # Determine if irrigation is needed
                moisture_threshold = 30  # Irrigate if moisture below 30%
                irrigation_needed = day_moisture < moisture_threshold
                
                # Calculate irrigation amount if needed
                if irrigation_needed:
                    irrigation_amount = irrigation_result['irrigation_requirement_mm']
                    # Adjust based on how dry the soil is
                    dryness_factor = (moisture_threshold - day_moisture) / moisture_threshold
                    irrigation_amount *= (1 + dryness_factor)
                else:
                    irrigation_amount = 0
                
                schedule.append({
                    'day': day + 1,
                    'date': (datetime.now() + timedelta(days=day)).strftime('%Y-%m-%d'),
                    'predicted_moisture': day_moisture,
                    'irrigation_needed': irrigation_needed,
                    'irrigation_amount_mm': round(irrigation_amount, 2) if irrigation_needed else 0,
                    'irrigation_liters': round(irrigation_amount * 10000 * input_data[i]['area_hectares'], 0) if irrigation_needed else 0
                })
            
            schedules.append({
                'field_id': i + 1,
                'crop_type': input_data[i]['crop_type'],
                'area_hectares': input_data[i]['area_hectares'],
                'schedule': schedule,
                'total_water_liters': sum(day['irrigation_liters'] for day in schedule)
            })
        
        return schedules
    
    def get_irrigation_recommendations(self, input_data):
        """Get comprehensive irrigation recommendations"""
        irrigation_results = self.predict_irrigation(input_data)
        schedules = self.generate_irrigation_schedule(input_data)
        
        recommendations = []
        
        for i, (irrigation_result, schedule) in enumerate(zip(irrigation_results, schedules)):
            # Analyze moisture trend
            moisture_trend = self.predict_moisture_trend([input_data[i]])[0]
            avg_moisture = np.mean(moisture_trend[1:])  # Exclude current day
            moisture_declining = moisture_trend[-1] < moisture_trend[0]
            
            # Generate recommendations
            if avg_moisture < 20:
                urgency = 'critical'
                action = 'Immediate irrigation required'
                frequency = 'Daily monitoring and irrigation as needed'
            elif avg_moisture < 35:
                urgency = 'high'
                action = 'Irrigation recommended within 24 hours'
                frequency = 'Every 2-3 days'
            elif avg_moisture < 50:
                urgency = 'moderate'
                action = 'Monitor soil moisture closely'
                frequency = 'Every 3-4 days'
            else:
                urgency = 'low'
                action = 'Current moisture levels adequate'
                frequency = 'Weekly monitoring'
            
            # Water conservation tips
            conservation_tips = [
                'Irrigate during early morning or late evening to reduce evaporation',
                'Use drip irrigation for better water efficiency',
                'Check for leaks in irrigation system regularly',
                'Consider mulching to reduce water loss',
                'Adjust irrigation based on weather forecasts'
            ]
            
            recommendations.append({
                'field_id': i + 1,
                'urgency_level': urgency,
                'recommended_action': action,
                'monitoring_frequency': frequency,
                'current_moisture': input_data[i]['current_moisture'],
                'avg_predicted_moisture': round(avg_moisture, 1),
                'moisture_trend': 'declining' if moisture_declining else 'stable',
                'total_weekly_water_liters': schedule['total_water_liters'],
                'conservation_tips': conservation_tips[:3],  # Top 3 tips
                'schedule': schedule['schedule']
            })
        
        return recommendations
    
    def save_models(self, model_dir='models'):
        """Save trained models"""
        import os
        os.makedirs(model_dir, exist_ok=True)
        
        # Save models
        joblib.dump(self.irrigation_model, f'{model_dir}/irrigation_model.pkl')
        joblib.dump(self.moisture_predictor, f'{model_dir}/moisture_predictor.pkl')
        joblib.dump(self.scaler, f'{model_dir}/irrigation_scaler.pkl')
        joblib.dump(self.crop_encoder, f'{model_dir}/irrigation_crop_encoder.pkl')
        joblib.dump(self.soil_encoder, f'{model_dir}/irrigation_soil_encoder.pkl')
        
        # Save metadata
        metadata = {
            'crop_types': self.crop_types,
            'soil_types': self.soil_types,
            'model_type': 'Smart Irrigation System',
            'version': '1.0.0',
            'created_at': datetime.now().isoformat()
        }
        
        with open(f'{model_dir}/irrigation_metadata.json', 'w') as f:
            json.dump(metadata, f, indent=2)
        
        print(f"✅ Models saved to {model_dir}")
    
    def load_models(self, model_dir='models'):
        """Load trained models"""
        try:
            self.irrigation_model = joblib.load(f'{model_dir}/irrigation_model.pkl')
            self.moisture_predictor = joblib.load(f'{model_dir}/moisture_predictor.pkl')
            self.scaler = joblib.load(f'{model_dir}/irrigation_scaler.pkl')
            self.crop_encoder = joblib.load(f'{model_dir}/irrigation_crop_encoder.pkl')
            self.soil_encoder = joblib.load(f'{model_dir}/irrigation_soil_encoder.pkl')
            
            # Load metadata
            with open(f'{model_dir}/irrigation_metadata.json', 'r') as f:
                metadata = json.load(f)
                self.crop_types = metadata['crop_types']
                self.soil_types = metadata['soil_types']
            
            print(f"✅ Models loaded from {model_dir}")
            return True
        except Exception as e:
            print(f"❌ Error loading models: {e}")
            return False

# Example usage
if __name__ == "__main__":
    # Initialize and train the system
    irrigation_system = SmartIrrigationSystem()
    
    # Train models
    metrics = irrigation_system.train_models()
    print(f"Training completed: {metrics}")
    
    # Save models
    irrigation_system.save_models()
    
    # Example prediction
    sample_input = {
        'crop_type': 'Rice',
        'soil_type': 'Loam',
        'temperature': 28.5,
        'humidity': 75,
        'rainfall': 5.2,
        'wind_speed': 8.5,
        'solar_radiation': 650,
        'current_moisture': 45,
        'ph': 6.8,
        'organic_matter': 2.5,
        'growth_stage': 0.6,
        'area_hectares': 2.5,
        'field_slope': 3.0
    }
    
    # Get predictions
    irrigation_pred = irrigation_system.predict_irrigation([sample_input])
    recommendations = irrigation_system.get_irrigation_recommendations([sample_input])
    
    print(f"Irrigation requirement: {irrigation_pred[0]['irrigation_requirement_mm']} mm/day")
    print(f"Total water needed: {irrigation_pred[0]['total_liters']} liters")
    print(f"Urgency: {recommendations[0]['urgency_level']}")
