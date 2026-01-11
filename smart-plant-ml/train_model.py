import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow import keras
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt
import json
from datetime import datetime

print("=" * 60)
print("Smart Plant ML Model Training")
print("=" * 60)
print(f"TensorFlow Version: {tf.__version__}\n")
# ==================================================================

# GENERATE TRAINING DATA
def generate_plant_data(num_samples=3000):
    """
    Generate synthetic training data
    
    Features:
    - moisture: kelembaban tanah (0-100%)
    - hour: jam dalam sehari (0-23)
    - days_since_water: hari sejak terakhir disiram (0-7)
    - temperature: suhu (15-35°C)
    - humidity: kelembaban udara (30-90%)
    
    Label:
    - needs_water: 1 jika perlu disiram, 0 jika tidak
    """
    
    print("Generating training data...")
    
    data = []
    
    for _ in range(num_samples):
        # Random features
        moisture = np.random.uniform(0, 100)
        hour = np.random.randint(0, 24)
        days_since_water = np.random.uniform(0, 7)
        temperature = np.random.uniform(15, 35)
        air_humidity = np.random.uniform(30, 90)
        
        # Decision logic untuk label (rules-based)
        needs_water = 0
        
        # Rule 1: Kelembaban tanah rendah
        if moisture < 30:
            needs_water = 1
        
        # Rule 2: Sudah lama tidak disiram
        elif days_since_water > 3:
            needs_water = 1
        
        # Rule 3: Kelembaban sedang + cuaca panas
        elif moisture < 50 and temperature > 30:
            needs_water = 1
        
        # Rule 4: Waktu penyiraman ideal (pagi 6-8 atau sore 17-19)
        elif moisture < 60 and (6 <= hour <= 8 or 17 <= hour <= 19):
            needs_water = 1
        
        # Rule 5: Kombinasi faktor
        elif moisture < 45 and air_humidity < 50 and days_since_water > 1.5:
            needs_water = 1
        
        data.append([
            moisture,
            hour,
            days_since_water,
            temperature,
            air_humidity,
            needs_water
        ])
    
    df = pd.DataFrame(data, columns=[
        'moisture', 'hour', 'days_since_water', 
        'temperature', 'air_humidity', 'needs_water'
    ])
    
    print(f"Generated {len(df)} samples")
    print(f"\nClass distribution:")
    print(df['needs_water'].value_counts())
    print(f"\nSample data:")
    print(df.head(10))
    
    return df

# Generate data
df = generate_plant_data(3000)

# Save dataset
df.to_csv('plant_dataset.csv', index=False)
print("\nDataset saved: plant_dataset.csv")
# ===================================================================

# ===================================================================
# PREPARE DATA

print("\n" + "=" * 60)
print("Preparing data for training...")
print("=" * 60)

# Split features and labels
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

# Save scaler parameters
scaler_params = {
    'mean': scaler.mean_.tolist(),
    'scale': scaler.scale_.tolist(),
    'feature_names': ['moisture', 'hour', 'days_since_water', 'temperature', 'air_humidity']
}

with open('scaler_params.json', 'w') as f:
    json.dump(scaler_params, f, indent=2)

print("Scaler parameters saved: scaler_params.json")
# ==================================================================================


# ==================================================================================
# 3. BUILD MODEL

print("\n" + "=" * 60)
print("Building neural network model...")
print("=" * 60)

model = keras.Sequential([
    keras.layers.Input(shape=(5,)),
    keras.layers.Dense(32, activation='relu', name='layer_1'),
    keras.layers.Dropout(0.3),
    keras.layers.Dense(16, activation='relu', name='layer_2'),
    keras.layers.Dropout(0.2),
    keras.layers.Dense(8, activation='relu', name='layer_3'),
    keras.layers.Dense(1, activation='sigmoid', name='output')
])

model.compile(
    optimizer=keras.optimizers.Adam(learning_rate=0.001),
    loss='binary_crossentropy',
    metrics=['accuracy', keras.metrics.Precision(), keras.metrics.Recall()]
)

print(model.summary())
# ================================================================================


# ================================================================================
# 4. TRAIN MODEL

print("\n" + "=" * 60)
print("Training model...")
print("=" * 60)

# Callbacks
early_stop = keras.callbacks.EarlyStopping(
    monitor='val_loss',
    patience=15,
    restore_best_weights=True,
    verbose=1
)

reduce_lr = keras.callbacks.ReduceLROnPlateau(
    monitor='val_loss',
    factor=0.5,
    patience=5,
    min_lr=0.00001,
    verbose=1
)

# Train
history = model.fit(
    X_train_scaled, y_train,
    validation_split=0.2,
    epochs=100,
    batch_size=32,
    callbacks=[early_stop, reduce_lr],
    verbose=1
)

print("\nTraining complete!")
# =============================================================================


# =============================================================================
# 5. EVALUATE MODEL

print("\n" + "=" * 60)
print("Evaluating model...")
print("=" * 60)

# Test set evaluation
test_results = model.evaluate(X_test_scaled, y_test, verbose=0)
test_loss = test_results[0]
test_acc = test_results[1]
test_precision = test_results[2]
test_recall = test_results[3]

print(f"\nTest Results:")
print(f"  Accuracy:  {test_acc:.4f} ({test_acc*100:.2f}%)")
print(f"  Precision: {test_precision:.4f}")
print(f"  Recall:    {test_recall:.4f}")
print(f"  Loss:      {test_loss:.4f}")

# Predictions
y_pred_prob = model.predict(X_test_scaled, verbose=0)
y_pred = (y_pred_prob > 0.5).astype(int)

# Confusion Matrix
from sklearn.metrics import confusion_matrix, classification_report

cm = confusion_matrix(y_test, y_pred)
print(f"\nConfusion Matrix:")
print(cm)

print(f"\n📋 Classification Report:")
print(classification_report(y_test, y_pred, 
                          target_names=['No Water Needed', 'Water Needed']))

# ==============================================================================


# ==============================================================================
# 6. VISUALIZE TRAINING

print("\nCreating training visualizations...")

plt.figure(figsize=(15, 5))

# Accuracy
plt.subplot(1, 3, 1)
plt.plot(history.history['accuracy'], label='Train', linewidth=2)
plt.plot(history.history['val_accuracy'], label='Validation', linewidth=2)
plt.title('Model Accuracy', fontsize=14, fontweight='bold')
plt.xlabel('Epoch')
plt.ylabel('Accuracy')
plt.legend()
plt.grid(True, alpha=0.3)

# Loss
plt.subplot(1, 3, 2)
plt.plot(history.history['loss'], label='Train', linewidth=2)
plt.plot(history.history['val_loss'], label='Validation', linewidth=2)
plt.title('Model Loss', fontsize=14, fontweight='bold')
plt.xlabel('Epoch')
plt.ylabel('Loss')
plt.legend()
plt.grid(True, alpha=0.3)

# Precision & Recall
plt.subplot(1, 3, 3)
plt.plot(history.history['precision'], label='Precision', linewidth=2)
plt.plot(history.history['recall'], label='Recall', linewidth=2)
plt.title('Precision & Recall', fontsize=14, fontweight='bold')
plt.xlabel('Epoch')
plt.ylabel('Score')
plt.legend()
plt.grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig('training_history.png', dpi=300, bbox_inches='tight')
print("Visualization saved: training_history.png")

# ===================================================================================


# ===================================================================================
# 7. SAVE MODELS

print("\n" + "=" * 60)
print("Saving models...")
print("=" * 60)

# Save for TensorFlow.js (Node.js)
import tensorflowjs as tfjs
print("Saving TensorFlow.js model...")
try:
    tfjs.converters.save_keras_model(model, 'models/plant-model')
    print("Model saved successfully!")
except Exception as e:
    print("ERROR saving model:", e)

# Save metadata
metadata = {
    'model_version': '1.0.0',
    'created_at': datetime.now().isoformat(),
    'training_samples': len(X_train),
    'test_samples': len(X_test),
    'accuracy': float(test_acc),
    'precision': float(test_precision),
    'recall': float(test_recall),
    'loss': float(test_loss),
    'features': ['moisture', 'hour', 'days_since_water', 'temperature', 'air_humidity'],
    'input_shape': [1, 5],
    'output_shape': [1, 1],
    'threshold': 0.5,
    'model_type': 'binary_classification'
}

with open('model_metadata.json', 'w') as f:
    json.dump(metadata, f, indent=2)

print("Metadata saved: model_metadata.json")

# =========================================================================================


# =========================================================================================
# 8. TEST PREDICTIONS

print("\n" + "=" * 60)
print("Testing predictions...")
print("=" * 60)

# Test scenarios
scenarios = [
    {
        'name': 'Tanah Kering - Perlu Air',
        'moisture': 25, 'hour': 7, 'days_since_water': 2, 
        'temperature': 28, 'air_humidity': 60
    },
    {
        'name': 'Tanah Lembab - Tidak Perlu',
        'moisture': 70, 'hour': 13, 'days_since_water': 0.5,
        'temperature': 32, 'air_humidity': 45
    },
    {
        'name': 'Tanah Sedang - Pagi Hari',
        'moisture': 45, 'hour': 7, 'days_since_water': 1.5,
        'temperature': 26, 'air_humidity': 65
    },
    {
        'name': 'Tanah Sangat Kering',
        'moisture': 15, 'hour': 10, 'days_since_water': 4,
        'temperature': 35, 'air_humidity': 35
    }
]

print("\nPrediction Examples:")
print("=" * 70)

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
    
    needs_water = "YA" if prediction > 0.5 else "TIDAK"
    
    print(f"\n{scenario['name']}:")
    print(f"  Kelembaban: {scenario['moisture']}% | Jam: {scenario['hour']}:00")
    print(f"  Suhu: {scenario['temperature']}°C | Humidity: {scenario['air_humidity']}%")
    print(f"  → Perlu Disiram: {needs_water} (confidence: {prediction:.2%})")

print("\n" + "=" * 70)

# ============================================
# SUMMARY
# ============================================

print("\n" + "=" * 60)
print("TRAINING COMPLETE!")
print("=" * 60)
print("\nModel Performance:")
print(f"Accuracy:  {test_acc:.2%}")
print(f"Precision: {test_precision:.2%}")
print(f"Recall:    {test_recall:.2%}")
print("=" * 60)