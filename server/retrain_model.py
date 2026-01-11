#!/usr/bin/env python3
# ============================================
# RETRAIN_MODEL.PY
# AI-Enhanced Model Retraining Script
# ============================================

import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow import keras
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.utils import class_weight
import matplotlib.pyplot as plt
import json
from datetime import datetime
import os
import sys

print("=" * 70)
print("🔄 AI-Enhanced ML Model Retraining")
print("=" * 70)
print(f"TensorFlow Version: {tf.__version__}")
print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

# ============================================
# 1. LOAD EXISTING TRAINING DATA
# ============================================

print("📂 Loading training data...")

# Original synthetic data
original_data = None
if os.path.exists('plant_dataset.csv'):
    original_data = pd.read_csv('plant_dataset.csv')
    print(f"✅ Loaded {len(original_data)} samples from original dataset")
else:
    print("⚠️  No original dataset found")

# AI-generated data
ai_data = None
if os.path.exists('ai_training_data.csv'):
    ai_data = pd.read_csv('ai_training_data.csv')
    print(f"✅ Loaded {len(ai_data)} samples from AI analysis")
else:
    print("⚠️  No AI training data found")

# ============================================
# 2. COMBINE DATASETS
# ============================================

if original_data is not None and ai_data is not None:
    print("\n🔀 Combining datasets...")
    
    # Combine
    combined_data = pd.concat([original_data, ai_data], ignore_index=True)
    
    # Remove duplicates
    combined_data = combined_data.drop_duplicates(
        subset=['moisture', 'hour', 'days_since_water', 'temperature', 'air_humidity']
    )
    
    print(f"📊 Combined dataset: {len(combined_data)} samples")
    print(f"   - Original: {len(original_data)}")
    print(f"   - AI-generated: {len(ai_data)}")
    print(f"   - After deduplication: {len(combined_data)}")
    
    df = combined_data
    
elif ai_data is not None:
    print("\n⚠️  Using only AI-generated data")
    df = ai_data
    
elif original_data is not None:
    print("\n⚠️  Using only original data")
    df = original_data
    
else:
    print("\n❌ No training data available!")
    print("Please run the server and generate AI analyses first.")
    sys.exit(1)

# ============================================
# 3. DATA ANALYSIS
# ============================================

print("\n" + "=" * 70)
print("📊 Data Analysis")
print("=" * 70)

print(f"\nDataset shape: {df.shape}")
print(f"\nClass distribution:")
print(df['needs_water'].value_counts())
print(f"\nClass percentage:")
print(df['needs_water'].value_counts(normalize=True) * 100)

# ============================================
# 4. PREPARE DATA
# ============================================

print("\n" + "=" * 70)
print("🔧 Preparing data for training...")
print("=" * 70)

# Features and labels
X = df[['moisture', 'hour', 'days_since_water', 'temperature', 'air_humidity']].values
y = df['needs_water'].values

# Split train/test
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# Normalize features
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

print(f"Training samples: {len(X_train)}")
print(f"Testing samples: {len(X_test)}")

# Calculate class weights (to handle imbalanced data)
class_weights = class_weight.compute_class_weight(
    'balanced',
    classes=np.unique(y_train),
    y=y_train
)
class_weight_dict = {i: weight for i, weight in enumerate(class_weights)}
print(f"\nClass weights: {class_weight_dict}")

# Save scaler parameters
scaler_params = {
    'mean': scaler.mean_.tolist(),
    'scale': scaler.scale_.tolist(),
    'feature_names': ['moisture', 'hour', 'days_since_water', 'temperature', 'air_humidity']
}

with open('scaler_params.json', 'w') as f:
    json.dump(scaler_params, f, indent=2)

print("✅ Scaler parameters saved")

# ============================================
# 5. BUILD IMPROVED MODEL
# ============================================

print("\n" + "=" * 70)
print("🏗️  Building neural network...")
print("=" * 70)

model = keras.Sequential([
    keras.layers.Input(shape=(5,)),
    keras.layers.Dense(64, activation='relu', name='layer_1'),
    keras.layers.BatchNormalization(),
    keras.layers.Dropout(0.3),
    keras.layers.Dense(32, activation='relu', name='layer_2'),
    keras.layers.BatchNormalization(),
    keras.layers.Dropout(0.2),
    keras.layers.Dense(16, activation='relu', name='layer_3'),
    keras.layers.Dropout(0.1),
    keras.layers.Dense(1, activation='sigmoid', name='output')
])

model.compile(
    optimizer=keras.optimizers.Adam(learning_rate=0.001),
    loss='binary_crossentropy',
    metrics=[
        'accuracy',
        keras.metrics.Precision(name='precision'),
        keras.metrics.Recall(name='recall'),
        keras.metrics.AUC(name='auc')
    ]
)

print(model.summary())

# ============================================
# 6. TRAIN MODEL
# ============================================

print("\n" + "=" * 70)
print("🎓 Training model with AI-enhanced data...")
print("=" * 70)

early_stop = keras.callbacks.EarlyStopping(
    monitor='val_loss',
    patience=20,
    restore_best_weights=True,
    verbose=1
)

reduce_lr = keras.callbacks.ReduceLROnPlateau(
    monitor='val_loss',
    factor=0.5,
    patience=8,
    min_lr=0.00001,
    verbose=1
)

checkpoint = keras.callbacks.ModelCheckpoint(
    'best_model.keras',
    monitor='val_accuracy',
    save_best_only=True,
    verbose=0
)

history = model.fit(
    X_train_scaled, y_train,
    validation_split=0.2,
    epochs=150,
    batch_size=32,
    class_weight=class_weight_dict,
    callbacks=[early_stop, reduce_lr, checkpoint],
    verbose=1
)

print("\n✅ Training complete!")

# ============================================
# 7. EVALUATE MODEL
# ============================================

print("\n" + "=" * 70)
print("📈 Evaluating model performance...")
print("=" * 70)

test_results = model.evaluate(X_test_scaled, y_test, verbose=0)
test_loss = test_results[0]
test_acc = test_results[1]
test_precision = test_results[2]
test_recall = test_results[3]
test_auc = test_results[4]

f1_score = 2 * (test_precision * test_recall) / (test_precision + test_recall)

print(f"\n📊 Test Results:")
print(f"  Accuracy:  {test_acc:.4f} ({test_acc*100:.2f}%)")
print(f"  Precision: {test_precision:.4f}")
print(f"  Recall:    {test_recall:.4f}")
print(f"  F1-Score:  {f1_score:.4f}")
print(f"  AUC:       {test_auc:.4f}")
print(f"  Loss:      {test_loss:.4f}")

y_pred_prob = model.predict(X_test_scaled, verbose=0)
y_pred = (y_pred_prob > 0.5).astype(int)

from sklearn.metrics import confusion_matrix, classification_report

cm = confusion_matrix(y_test, y_pred)
print(f"\n🔢 Confusion Matrix:")
print(cm)

print(f"\n📋 Classification Report:")
print(classification_report(y_test, y_pred, 
                          target_names=['No Water', 'Water Needed']))

# ============================================
# 8. SAVE MODEL
# ============================================

print("\n" + "=" * 70)
print("💾 Saving retrained model...")
print("=" * 70)

import tensorflowjs as tfjs

try:
    # Ensure directory exists
    os.makedirs('models/plant-model', exist_ok=True)
    
    # Save to TensorFlow.js format
    tfjs.converters.save_keras_model(model, 'models/plant-model')
    print("✅ Model saved successfully!")
except Exception as e:
    print(f"❌ ERROR saving model: {e}")
    sys.exit(1)

# Save metadata
metadata = {
    'model_version': '2.0.0-ai-enhanced',
    'created_at': datetime.now().isoformat(),
    'training_samples': len(X_train),
    'test_samples': len(X_test),
    'ai_samples_used': len(ai_data) if ai_data is not None else 0,
    'original_samples_used': len(original_data) if original_data is not None else 0,
    'accuracy': float(test_acc),
    'precision': float(test_precision),
    'recall': float(test_recall),
    'f1_score': float(f1_score),
    'auc': float(test_auc),
    'loss': float(test_loss),
    'features': ['moisture', 'hour', 'days_since_water', 'temperature', 'air_humidity'],
    'threshold': 0.5,
    'model_type': 'binary_classification',
    'training_method': 'ai_enhanced_retraining'
}

with open('model_metadata.json', 'w') as f:
    json.dump(metadata, f, indent=2)

print("✅ Metadata saved: model_metadata.json")

# Save combined dataset
combined_dataset_file = f'combined_dataset_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
df.to_csv(combined_dataset_file, index=False)
print(f"✅ Combined dataset saved: {combined_dataset_file}")

# ============================================
# 9. VISUALIZATION (Optional)
# ============================================

try:
    print("\n📊 Creating visualizations...")
    
    plt.figure(figsize=(12, 8))
    
    plt.subplot(2, 2, 1)
    plt.plot(history.history['accuracy'], label='Train', linewidth=2)
    plt.plot(history.history['val_accuracy'], label='Validation', linewidth=2)
    plt.title('Model Accuracy', fontsize=12, fontweight='bold')
    plt.xlabel('Epoch')
    plt.ylabel('Accuracy')
    plt.legend()
    plt.grid(True, alpha=0.3)
    
    plt.subplot(2, 2, 2)
    plt.plot(history.history['loss'], label='Train', linewidth=2)
    plt.plot(history.history['val_loss'], label='Validation', linewidth=2)
    plt.title('Model Loss', fontsize=12, fontweight='bold')
    plt.xlabel('Epoch')
    plt.ylabel('Loss')
    plt.legend()
    plt.grid(True, alpha=0.3)
    
    plt.subplot(2, 2, 3)
    plt.plot(history.history['precision'], label='Precision', linewidth=2)
    plt.plot(history.history['recall'], label='Recall', linewidth=2)
    plt.title('Precision & Recall', fontsize=12, fontweight='bold')
    plt.xlabel('Epoch')
    plt.ylabel('Score')
    plt.legend()
    plt.grid(True, alpha=0.3)
    
    plt.subplot(2, 2, 4)
    df['needs_water'].value_counts().plot(kind='bar', color=['skyblue', 'salmon'])
    plt.title('Class Distribution', fontsize=12, fontweight='bold')
    plt.xlabel('Needs Water')
    plt.ylabel('Count')
    plt.xticks(rotation=0)
    plt.grid(True, alpha=0.3, axis='y')
    
    plt.tight_layout()
    plt.savefig('retrain_results.png', dpi=150, bbox_inches='tight')
    print("✅ Visualization saved: retrain_results.png")
except Exception as e:
    print(f"⚠️  Visualization skipped: {e}")

# ============================================
# 10. TEST PREDICTIONS
# ============================================

print("\n" + "=" * 70)
print("🧪 Testing predictions...")
print("=" * 70)

scenarios = [
    {'name': 'Dry Soil', 'moisture': 25, 'hour': 7, 'days_since_water': 2, 'temperature': 28, 'air_humidity': 60},
    {'name': 'Wet Soil', 'moisture': 70, 'hour': 13, 'days_since_water': 0.5, 'temperature': 32, 'air_humidity': 45},
    {'name': 'Medium Soil', 'moisture': 45, 'hour': 7, 'days_since_water': 1.5, 'temperature': 26, 'air_humidity': 65}
]

for scenario in scenarios:
    input_data = np.array([[
        scenario['moisture'],
        scenario['hour'],
        scenario['days_since_water'],
        scenario['temperature'],
        scenario['air_humidity']
    ]])
    
    input_scaled = scaler.transform(input_data)
    prediction = model.predict(input_scaled, verbose=0)[0][0]
    
    needs_water = "YES" if prediction > 0.5 else "NO"
    
    print(f"\n{scenario['name']}:")
    print(f"  Moisture: {scenario['moisture']}% | Hour: {scenario['hour']}:00")
    print(f"  → Water needed: {needs_water} (confidence: {prediction:.2%})")

# ============================================
# SUMMARY
# ============================================

print("\n" + "=" * 70)
print("🎉 RETRAINING COMPLETE!")
print("=" * 70)
print(f"\n📊 Model Performance:")
print(f"  Accuracy:  {test_acc:.2%}")
print(f"  Precision: {test_precision:.2%}")
print(f"  Recall:    {test_recall:.2%}")
print(f"  F1-Score:  {f1_score:.2%}")
print(f"\n🔄 Training Data:")
print(f"  Original: {len(original_data) if original_data is not None else 0}")
print(f"  AI-generated: {len(ai_data) if ai_data is not None else 0}")
print(f"  Total: {len(df)}")
print(f"\n💡 Next Steps:")
print(f"  1. Restart Node.js server to load new model")
print(f"  2. Model saved in: models/plant-model/")
print("=" * 70)