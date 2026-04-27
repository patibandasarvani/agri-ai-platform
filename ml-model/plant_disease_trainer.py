import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Conv2D, MaxPooling2D, Flatten, Dropout, BatchNormalization, GlobalAveragePooling2D
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau, ModelCheckpoint
from sklearn.metrics import classification_report, confusion_matrix
import numpy as np
import matplotlib.pyplot as plt
import os
import cv2
from PIL import Image
import json
import pandas as pd

class PlantDiseaseTrainer:
    def __init__(self, img_size=224, batch_size=32):
        self.img_size = img_size
        self.batch_size = batch_size
        self.model = None
        self.class_names = []
        self.history = None
        
    def load_and_preprocess_data(self, data_dir):
        """
        Load and preprocess the PlantVillage dataset
        """
        print(f"Loading data from: {data_dir}")
        
        # Data augmentation for training
        train_datagen = ImageDataGenerator(
            rescale=1./255,
            rotation_range=20,
            width_shift_range=0.2,
            height_shift_range=0.2,
            horizontal_flip=True,
            vertical_flip=True,
            brightness_range=[0.8, 1.2],
            zoom_range=0.2,
            shear_range=0.2,
            fill_mode='nearest',
            validation_split=0.2
        )
        
        # Only rescaling for validation
        val_datagen = ImageDataGenerator(
            rescale=1./255,
            validation_split=0.2
        )
        
        # Load training data
        self.train_generator = train_datagen.flow_from_directory(
            data_dir,
            target_size=(self.img_size, self.img_size),
            batch_size=self.batch_size,
            class_mode='categorical',
            subset='training',
            shuffle=True
        )
        
        # Load validation data
        self.validation_generator = val_datagen.flow_from_directory(
            data_dir,
            target_size=(self.img_size, self.img_size),
            batch_size=self.batch_size,
            class_mode='categorical',
            subset='validation',
            shuffle=False
        )
        
        self.class_names = list(self.train_generator.class_indices.keys())
        self.num_classes = len(self.class_names)
        
        print(f"Found {self.num_classes} classes: {self.class_names}")
        print(f"Training samples: {self.train_generator.samples}")
        print(f"Validation samples: {self.validation_generator.samples}")
        
    def build_mobilenet_model(self):
        """
        Build MobileNetV2 model with transfer learning
        """
        # Load pretrained MobileNetV2
        base_model = MobileNetV2(
            input_shape=(self.img_size, self.img_size, 3),
            include_top=False,
            weights='imagenet'
        )
        
        # Freeze the base model initially
        base_model.trainable = False
        
        # Build the complete model
        model = Sequential([
            base_model,
            GlobalAveragePooling2D(),
            Dense(512, activation='relu'),
            BatchNormalization(),
            Dropout(0.5),
            Dense(256, activation='relu'),
            BatchNormalization(),
            Dropout(0.3),
            Dense(self.num_classes, activation='softmax')
        ])
        
        return model
    
    def build_custom_cnn(self):
        """
        Build a custom CNN model as alternative
        """
        model = Sequential([
            # First Convolutional Block
            Conv2D(32, (3, 3), activation='relu', input_shape=(self.img_size, self.img_size, 3)),
            BatchNormalization(),
            MaxPooling2D(2, 2),
            
            # Second Convolutional Block
            Conv2D(64, (3, 3), activation='relu'),
            BatchNormalization(),
            MaxPooling2D(2, 2),
            
            # Third Convolutional Block
            Conv2D(128, (3, 3), activation='relu'),
            BatchNormalization(),
            MaxPooling2D(2, 2),
            
            # Fourth Convolutional Block
            Conv2D(256, (3, 3), activation='relu'),
            BatchNormalization(),
            MaxPooling2D(2, 2),
            
            # Flatten and Dense Layers
            Flatten(),
            Dense(512, activation='relu'),
            BatchNormalization(),
            Dropout(0.5),
            Dense(256, activation='relu'),
            BatchNormalization(),
            Dropout(0.3),
            Dense(self.num_classes, activation='softmax')
        ])
        
        return model
    
    def train_model(self, model_type='mobilenet', epochs=20, fine_tune_epochs=10):
        """
        Train the selected model
        """
        if model_type == 'mobilenet':
            self.model = self.build_mobilenet_model()
        elif model_type == 'cnn':
            self.model = self.build_custom_cnn()
        else:
            raise ValueError("Model type must be 'mobilenet' or 'cnn'")
        
        # Compile the model
        self.model.compile(
            optimizer=Adam(learning_rate=0.001),
            loss='categorical_crossentropy',
            metrics=['accuracy', 'precision', 'recall']
        )
        
        # Define callbacks
        callbacks = [
            EarlyStopping(patience=5, restore_best_weights=True),
            ReduceLROnPlateau(factor=0.2, patience=3),
            ModelCheckpoint(
                'best_plant_disease_model.h5',
                save_best_only=True,
                monitor='val_accuracy'
            )
        ]
        
        print(f"Training {model_type} model for {epochs} epochs...")
        
        # Initial training
        history = self.model.fit(
            self.train_generator,
            epochs=epochs,
            validation_data=self.validation_generator,
            callbacks=callbacks
        )
        
        # Fine-tuning for MobileNetV2
        if model_type == 'mobilenet':
            print("Fine-tuning MobileNetV2...")
            
            # Unfreeze the base model
            self.model.layers[0].trainable = True
            
            # Re-compile with lower learning rate
            self.model.compile(
                optimizer=Adam(learning_rate=0.0001),
                loss='categorical_crossentropy',
                metrics=['accuracy', 'precision', 'recall']
            )
            
            # Continue training
            fine_tune_history = self.model.fit(
                self.train_generator,
                epochs=fine_tune_epochs,
                validation_data=self.validation_generator,
                callbacks=callbacks
            )
            
            # Combine histories
            history.history['accuracy'].extend(fine_tune_history.history['accuracy'])
            history.history['val_accuracy'].extend(fine_tune_history.history['val_accuracy'])
            history.history['loss'].extend(fine_tune_history.history['loss'])
            history.history['val_loss'].extend(fine_tune_history.history['val_loss'])
        
        self.history = history
        return history
    
    def evaluate_model(self):
        """
        Evaluate the model and print metrics
        """
        print("\nEvaluating model...")
        
        # Evaluate on validation set
        y_pred = self.model.predict(self.validation_generator)
        y_pred_classes = np.argmax(y_pred, axis=1)
        y_true = self.validation_generator.classes
        
        # Print classification report
        print("\nClassification Report:")
        print(classification_report(y_true, y_pred_classes, target_names=self.class_names))
        
        # Calculate and print metrics
        test_loss, test_acc, test_precision, test_recall = self.model.evaluate(self.validation_generator)
        f1_score = 2 * (test_precision * test_recall) / (test_precision + test_recall)
        
        print(f"\nTest Accuracy: {test_acc:.4f}")
        print(f"Test Precision: {test_precision:.4f}")
        print(f"Test Recall: {test_recall:.4f}")
        print(f"Test F1-Score: {f1_score:.4f}")
        
        return {
            'accuracy': test_acc,
            'precision': test_precision,
            'recall': test_recall,
            'f1_score': f1_score
        }
    
    def save_model(self, filename='plant_disease_model.h5'):
        """
        Save the trained model
        """
        self.model.save(filename)
        print(f"Model saved as {filename}")
        
        # Save class names
        with open('plant_disease_classes.json', 'w') as f:
            json.dump(self.class_names, f)
        print("Class names saved as plant_disease_classes.json")
        
        # Save model summary
        with open('model_summary.txt', 'w') as f:
            self.model.summary(print_fn=lambda x: f.write(x + '\n'))
        print("Model summary saved as model_summary.txt")
    
    def plot_training_history(self, save_plot=True):
        """
        Plot training history
        """
        if not self.history:
            print("No training history available")
            return
        
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 5))
        
        # Plot accuracy
        ax1.plot(self.history.history['accuracy'], label='Training Accuracy')
        ax1.plot(self.history.history['val_accuracy'], label='Validation Accuracy')
        ax1.set_title('Model Accuracy')
        ax1.set_xlabel('Epoch')
        ax1.set_ylabel('Accuracy')
        ax1.legend()
        ax1.grid(True)
        
        # Plot loss
        ax2.plot(self.history.history['loss'], label='Training Loss')
        ax2.plot(self.history.history['val_loss'], label='Validation Loss')
        ax2.set_title('Model Loss')
        ax2.set_xlabel('Epoch')
        ax2.set_ylabel('Loss')
        ax2.legend()
        ax2.grid(True)
        
        plt.tight_layout()
        
        if save_plot:
            plt.savefig('training_history.png', dpi=300, bbox_inches='tight')
            print("Training history plot saved as training_history.png")
        
        plt.show()
    
    def create_sample_data(self, num_samples=100):
        """
        Create sample data for testing when dataset is not available
        """
        print("Creating sample data for testing...")
        
        # Create sample directory structure
        sample_dir = 'sample_plant_data'
        os.makedirs(sample_dir, exist_ok=True)
        
        # Sample disease classes
        sample_classes = [
            'Tomato___Early_blight',
            'Tomato___Late_blight',
            'Tomato___healthy',
            'Apple___Apple_scab',
            'Apple___healthy',
            'Corn___Common_rust',
            'Corn___healthy'
        ]
        
        for disease_class in sample_classes:
            class_dir = os.path.join(sample_dir, disease_class)
            os.makedirs(class_dir, exist_ok=True)
            
            # Create sample images (random noise for demonstration)
            for i in range(num_samples):
                # Generate random image
                img_array = np.random.randint(0, 255, (self.img_size, self.img_size, 3), dtype=np.uint8)
                img = Image.fromarray(img_array)
                img.save(os.path.join(class_dir, f'sample_{i}.jpg'))
        
        print(f"Sample data created in {sample_dir}")
        return sample_dir

def main():
    """
    Main function to train the plant disease detection model
    """
    print("🌱 Plant Disease Detection Model Training")
    print("=" * 50)
    
    # Initialize the trainer
    trainer = PlantDiseaseTrainer(img_size=224, batch_size=32)
    
    # Check if dataset exists
    data_dir = 'dataset/PlantVillage'
    if not os.path.exists(data_dir):
        print(f"❌ Dataset directory {data_dir} not found!")
        print("📁 Creating sample data for demonstration...")
        data_dir = trainer.create_sample_data(num_samples=50)
    
    # Load and preprocess data
    trainer.load_and_preprocess_data(data_dir)
    
    # Train the model
    print("\n🚀 Starting model training...")
    history = trainer.train_model(model_type='mobilenet', epochs=5, fine_tune_epochs=3)
    
    # Evaluate the model
    print("\n📊 Evaluating model...")
    metrics = trainer.evaluate_model()
    
    # Save the model
    print("\n💾 Saving model...")
    trainer.save_model('plant_disease_model.h5')
    
    # Plot training history
    print("\n📈 Plotting training history...")
    trainer.plot_training_history()
    
    print("\n✅ Training completed successfully!")
    print(f"📁 Model saved as: plant_disease_model.h5")
    print(f"📁 Classes saved as: plant_disease_classes.json")
    print(f"📊 Final accuracy: {metrics['accuracy']:.4f}")
    print(f"📊 Final F1-score: {metrics['f1_score']:.4f}")

if __name__ == "__main__":
    main()
