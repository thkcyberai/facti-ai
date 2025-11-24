"""
Document Fraud Detection Model Training
Using XceptionNet (same as our 99.90% deepfake model)
Binary Classification: Real ID vs Fake ID
"""

import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'  # Suppress TensorFlow warnings

import tensorflow as tf
from tensorflow.keras.applications import Xception
from tensorflow.keras.layers import GlobalAveragePooling2D, Dense, Dropout
from tensorflow.keras.models import Model
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau
from tensorflow.keras.optimizers import Adam
import numpy as np
from datetime import datetime

print("=" * 60)
print("DOCUMENT FRAUD DETECTION - MODEL TRAINING")
print("=" * 60)

# Configuration
IMG_SIZE = 299  # XceptionNet input size
BATCH_SIZE = 16
EPOCHS = 30
LEARNING_RATE = 0.0001

DATASET_DIR = "dataset/synthetic"
MODEL_DIR = "models"
os.makedirs(MODEL_DIR, exist_ok=True)

print(f"\nConfiguration:")
print(f"  Image Size: {IMG_SIZE}x{IMG_SIZE}")
print(f"  Batch Size: {BATCH_SIZE}")
print(f"  Epochs: {EPOCHS}")
print(f"  Learning Rate: {LEARNING_RATE}")
print(f"  Model: XceptionNet (transfer learning)")

# Data Augmentation
print("\n📊 Setting up data augmentation...")
train_datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=10,
    width_shift_range=0.1,
    height_shift_range=0.1,
    shear_range=0.1,
    zoom_range=0.1,
    horizontal_flip=False,  # IDs shouldn't be flipped
    fill_mode='nearest',
    validation_split=0.2  # 80% train, 20% validation
)

# Load training data
print("\n📁 Loading training data...")
train_generator = train_datagen.flow_from_directory(
    DATASET_DIR,
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode='binary',
    subset='training',
    shuffle=True
)

# Load validation data
validation_generator = train_datagen.flow_from_directory(
    DATASET_DIR,
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode='binary',
    subset='validation',
    shuffle=False
)

print(f"\n✅ Data loaded:")
print(f"  Training samples: {train_generator.samples}")
print(f"  Validation samples: {validation_generator.samples}")
print(f"  Classes: {train_generator.class_indices}")

# Build Model
print("\n🏗️ Building XceptionNet model...")
base_model = Xception(
    weights='imagenet',
    include_top=False,
    input_shape=(IMG_SIZE, IMG_SIZE, 3)
)

# Freeze base model initially
base_model.trainable = False

# Add custom classification head
x = base_model.output
x = GlobalAveragePooling2D()(x)
x = Dense(512, activation='relu')(x)
x = Dropout(0.5)(x)
x = Dense(256, activation='relu')(x)
x = Dropout(0.3)(x)
predictions = Dense(1, activation='sigmoid')(x)  # Binary: Real (0) or Fake (1)

model = Model(inputs=base_model.input, outputs=predictions)

# Compile model
model.compile(
    optimizer=Adam(learning_rate=LEARNING_RATE),
    loss='binary_crossentropy',
    metrics=['accuracy', tf.keras.metrics.AUC(name='auc')]
)

print(f"✅ Model built:")
print(f"  Total parameters: {model.count_params():,}")
print(f"  Trainable parameters: {sum([tf.size(v).numpy() for v in model.trainable_variables]):,}")

# Callbacks
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
model_path = f"{MODEL_DIR}/document_fraud_xceptionnet_{timestamp}.h5"

callbacks = [
    ModelCheckpoint(
        model_path,
        monitor='val_accuracy',
        save_best_only=True,
        verbose=1
    ),
    EarlyStopping(
        monitor='val_loss',
        patience=5,
        verbose=1,
        restore_best_weights=True
    ),
    ReduceLROnPlateau(
        monitor='val_loss',
        factor=0.5,
        patience=3,
        min_lr=1e-7,
        verbose=1
    )
]

# Training
print("\n🚀 Starting training...")
print(f"Model will be saved to: {model_path}")
print("=" * 60)

history = model.fit(
    train_generator,
    epochs=EPOCHS,
    validation_data=validation_generator,
    callbacks=callbacks,
    verbose=1
)

# Evaluation
print("\n" + "=" * 60)
print("📊 TRAINING COMPLETE!")
print("=" * 60)

# Get final metrics
final_train_acc = history.history['accuracy'][-1]
final_val_acc = history.history['val_accuracy'][-1]
final_train_loss = history.history['loss'][-1]
final_val_loss = history.history['val_loss'][-1]

print(f"\nFinal Training Metrics:")
print(f"  Training Accuracy: {final_train_acc*100:.2f}%")
print(f"  Validation Accuracy: {final_val_acc*100:.2f}%")
print(f"  Training Loss: {final_train_loss:.4f}")
print(f"  Validation Loss: {final_val_loss:.4f}")

# Find best epoch
best_epoch = np.argmax(history.history['val_accuracy']) + 1
best_val_acc = np.max(history.history['val_accuracy'])
print(f"\nBest Model:")
print(f"  Epoch: {best_epoch}/{EPOCHS}")
print(f"  Validation Accuracy: {best_val_acc*100:.2f}%")
print(f"  Saved to: {model_path}")

print("\n✅ Model training complete and saved!")
print("=" * 60)
