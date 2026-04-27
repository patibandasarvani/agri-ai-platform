import pandas as pd
import numpy as np
from sklearn.datasets import make_classification
import random

class AgricultureDatasetGenerator:
    """
    Professional dataset generator for agriculture ML models.
    Generates realistic soil and environmental data for crop prediction.
    """
    
    def __init__(self):
        self.crops = [
            'Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane', 'Soybean',
            'Barley', 'Millet', 'Pulses', 'Groundnut', 'Mustard', 'Potato',
            'Tomato', 'Onion', 'Chili', 'Cabbage', 'Cauliflower', 'Brinjal',
            'Okra', 'Peas', 'Carrot', 'Radish'
        ]
        
        # Crop-specific parameter ranges based on agricultural research
        self.crop_requirements = {
            'Rice': {'N': (80, 120), 'P': (40, 60), 'K': (40, 60), 'temp': (20, 35), 'humidity': (60, 90), 'ph': (5.5, 7.0), 'rainfall': (100, 300)},
            'Wheat': {'N': (100, 150), 'P': (50, 70), 'K': (40, 60), 'temp': (10, 25), 'humidity': (40, 70), 'ph': (6.0, 7.5), 'rainfall': (50, 150)},
            'Maize': {'N': (120, 180), 'P': (60, 80), 'K': (50, 70), 'temp': (15, 30), 'humidity': (50, 80), 'ph': (5.5, 7.5), 'rainfall': (60, 200)},
            'Cotton': {'N': (100, 140), 'P': (60, 80), 'K': (50, 70), 'temp': (20, 35), 'humidity': (40, 70), 'ph': (6.0, 8.0), 'rainfall': (40, 150)},
            'Sugarcane': {'N': (150, 200), 'P': (70, 90), 'K': (100, 140), 'temp': (20, 35), 'humidity': (60, 85), 'ph': (6.0, 7.5), 'rainfall': (100, 250)},
            'Soybean': {'N': (30, 50), 'P': (50, 70), 'K': (30, 50), 'temp': (20, 30), 'humidity': (50, 80), 'ph': (6.0, 7.0), 'rainfall': (60, 180)},
            'Barley': {'N': (80, 120), 'P': (40, 60), 'K': (40, 60), 'temp': (10, 25), 'humidity': (40, 70), 'ph': (6.0, 7.5), 'rainfall': (40, 120)},
            'Millet': {'N': (60, 90), 'P': (30, 50), 'K': (30, 50), 'temp': (25, 35), 'humidity': (30, 60), 'ph': (6.0, 8.0), 'rainfall': (30, 100)},
            'Pulses': {'N': (40, 60), 'P': (40, 60), 'K': (30, 50), 'temp': (15, 30), 'humidity': (40, 70), 'ph': (6.0, 7.5), 'rainfall': (50, 150)},
            'Groundnut': {'N': (40, 60), 'P': (50, 70), 'K': (40, 60), 'temp': (25, 35), 'humidity': (50, 80), 'ph': (5.5, 7.0), 'rainfall': (60, 180)},
            'Mustard': {'N': (80, 120), 'P': (50, 70), 'K': (40, 60), 'temp': (10, 25), 'humidity': (40, 70), 'ph': (6.0, 7.5), 'rainfall': (40, 120)},
            'Potato': {'N': (120, 160), 'P': (60, 80), 'K': (100, 140), 'temp': (15, 25), 'humidity': (60, 85), 'ph': (5.0, 6.5), 'rainfall': (80, 200)},
            'Tomato': {'N': (100, 140), 'P': (60, 80), 'K': (100, 140), 'temp': (18, 28), 'humidity': (60, 85), 'ph': (6.0, 7.0), 'rainfall': (60, 180)},
            'Onion': {'N': (80, 120), 'P': (50, 70), 'K': (60, 80), 'temp': (15, 25), 'humidity': (50, 75), 'ph': (6.0, 7.5), 'rainfall': (50, 150)},
            'Chili': {'N': (100, 140), 'P': (60, 80), 'K': (80, 120), 'temp': (20, 30), 'humidity': (60, 85), 'ph': (6.0, 7.0), 'rainfall': (80, 200)},
            'Cabbage': {'N': (120, 160), 'P': (60, 80), 'K': (100, 140), 'temp': (15, 22), 'humidity': (60, 85), 'ph': (6.0, 7.0), 'rainfall': (80, 200)},
            'Cauliflower': {'N': (120, 160), 'P': (60, 80), 'K': (100, 140), 'temp': (15, 22), 'humidity': (60, 85), 'ph': (6.0, 7.0), 'rainfall': (80, 200)},
            'Brinjal': {'N': (100, 140), 'P': (60, 80), 'K': (80, 120), 'temp': (22, 32), 'humidity': (60, 85), 'ph': (6.0, 7.5), 'rainfall': (80, 200)},
            'Okra': {'N': (80, 120), 'P': (50, 70), 'K': (60, 80), 'temp': (22, 32), 'humidity': (60, 85), 'ph': (6.0, 7.5), 'rainfall': (80, 200)},
            'Peas': {'N': (40, 60), 'P': (50, 70), 'K': (40, 60), 'temp': (10, 20), 'humidity': (50, 75), 'ph': (6.0, 7.5), 'rainfall': (40, 120)},
            'Carrot': {'N': (80, 120), 'P': (50, 70), 'K': (100, 140), 'temp': (15, 22), 'humidity': (60, 85), 'ph': (6.0, 7.0), 'rainfall': (60, 180)},
            'Radish': {'N': (60, 90), 'P': (40, 60), 'K': (80, 120), 'temp': (15, 22), 'humidity': (50, 75), 'ph': (6.0, 7.5), 'rainfall': (50, 150)}
        }
    
    def generate_realistic_sample(self, crop):
        """
        Generate realistic soil and environmental parameters for a specific crop.
        """
        req = self.crop_requirements[crop]
        
        # Add some realistic variation
        def vary_range(base_range, variation=0.15):
            min_val, max_val = base_range
            center = (min_val + max_val) / 2
            span = (max_val - min_val) * (1 + variation)
            return (center - span/2, center + span/2)
        
        sample = {
            'N': np.random.normal(np.mean(self.crop_requirements[crop]['N']), 15),
            'P': np.random.normal(np.mean(self.crop_requirements[crop]['P']), 10),
            'K': np.random.normal(np.mean(self.crop_requirements[crop]['K']), 12),
            'temperature': np.random.normal(np.mean(self.crop_requirements[crop]['temp']), 3),
            'humidity': np.random.normal(np.mean(self.crop_requirements[crop]['humidity']), 8),
            'ph': np.random.normal(np.mean(self.crop_requirements[crop]['ph']), 0.3),
            'rainfall': np.random.normal(np.mean(self.crop_requirements[crop]['rainfall']), 25)
        }
        
        # Ensure values are within realistic bounds
        sample['N'] = np.clip(sample['N'], 0, 250)
        sample['P'] = np.clip(sample['P'], 0, 150)
        sample['K'] = np.clip(sample['K'], 0, 200)
        sample['temperature'] = np.clip(sample['temperature'], 0, 45)
        sample['humidity'] = np.clip(sample['humidity'], 10, 100)
        sample['ph'] = np.clip(sample['ph'], 3.5, 9.0)
        sample['rainfall'] = np.clip(sample['rainfall'], 0, 400)
        
        return sample
    
    def generate_dataset(self, samples_per_crop=150):
        """
        Generate a comprehensive agriculture dataset.
        """
        print(f"🌱 Generating agriculture dataset with {samples_per_crop} samples per crop...")
        
        data = []
        
        for crop in self.crops:
            print(f"  Generating samples for {crop}...")
            for _ in range(samples_per_crop):
                sample = self.generate_realistic_sample(crop)
                sample['crop'] = crop
                data.append(sample)
        
        # Convert to DataFrame
        df = pd.DataFrame(data)
        
        # Add some noise and cross-crop samples for realism
        print("  Adding realistic variations...")
        cross_crop_samples = int(len(df) * 0.1)  # 10% cross-crop samples
        
        for _ in range(cross_crop_samples):
            crop1, crop2 = random.sample(self.crops, 2)
            sample1 = self.generate_realistic_sample(crop1)
            sample2 = self.generate_realistic_sample(crop2)
            
            # Mix parameters
            mixed_sample = {
                'N': (sample1['N'] + sample2['N']) / 2 + np.random.normal(0, 10),
                'P': (sample1['P'] + sample2['P']) / 2 + np.random.normal(0, 8),
                'K': (sample1['K'] + sample2['K']) / 2 + np.random.normal(0, 10),
                'temperature': (sample1['temperature'] + sample2['temperature']) / 2 + np.random.normal(0, 2),
                'humidity': (sample1['humidity'] + sample2['humidity']) / 2 + np.random.normal(0, 5),
                'ph': (sample1['ph'] + sample2['ph']) / 2 + np.random.normal(0, 0.2),
                'rainfall': (sample1['rainfall'] + sample2['rainfall']) / 2 + np.random.normal(0, 15),
                'crop': crop1 if random.random() > 0.5 else crop2
            }
            
            # Clip values
            mixed_sample['N'] = np.clip(mixed_sample['N'], 0, 250)
            mixed_sample['P'] = np.clip(mixed_sample['P'], 0, 150)
            mixed_sample['K'] = np.clip(mixed_sample['K'], 0, 200)
            mixed_sample['temperature'] = np.clip(mixed_sample['temperature'], 0, 45)
            mixed_sample['humidity'] = np.clip(mixed_sample['humidity'], 10, 100)
            mixed_sample['ph'] = np.clip(mixed_sample['ph'], 3.5, 9.0)
            mixed_sample['rainfall'] = np.clip(mixed_sample['rainfall'], 0, 400)
            
            data.append(mixed_sample)
        
        # Final DataFrame
        df = pd.DataFrame(data)
        
        # Shuffle the dataset
        df = df.sample(frac=1).reset_index(drop=True)
        
        print(f"✅ Dataset generated successfully!")
        print(f"📊 Total samples: {len(df)}")
        print(f"🌾 Number of crops: {df['crop'].nunique()}")
        print(f"📈 Features: {list(df.columns[:-1])}")
        
        return df
    
    def save_dataset(self, df, filename='agriculture_dataset.csv'):
        """
        Save the dataset to CSV file.
        """
        filepath = f'data/{filename}'
        df.to_csv(filepath, index=False)
        print(f"💾 Dataset saved to {filepath}")
        
        # Display dataset statistics
        print("\n📊 Dataset Statistics:")
        print(f"Shape: {df.shape}")
        print(f"Crops: {sorted(df['crop'].unique())}")
        
        print("\n🔢 Feature Statistics:")
        print(df.describe())
        
        print("\n🌾 Crop Distribution:")
        print(df['crop'].value_counts())
        
        return filepath

def main():
    """
    Main function to generate and save the agriculture dataset.
    """
    generator = AgricultureDatasetGenerator()
    
    # Generate dataset
    df = generator.generate_dataset(samples_per_crop=150)
    
    # Save dataset
    filepath = generator.save_dataset(df)
    
    print(f"\n🎉 Agriculture dataset generation completed!")
    print(f"📁 Dataset saved at: {filepath}")
    print(f"🚀 Ready for ML model training!")

if __name__ == "__main__":
    main()
