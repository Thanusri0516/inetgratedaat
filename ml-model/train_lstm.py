import numpy as np
import pandas as pd
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense

# Load dataset
data = pd.read_csv("dataset.csv")
temps = data['temperature'].values

# Prepare data (window = 3)
X = []
y = []

window_size = 3

for i in range(len(temps) - window_size):
    X.append(temps[i:i+window_size])
    y.append(temps[i+window_size])

X = np.array(X)
y = np.array(y)

# Reshape for LSTM → (samples, time_steps, features)
X = X.reshape((X.shape[0], X.shape[1], 1))

# Build LSTM model
model = Sequential()
model.add(LSTM(50, activation='relu', input_shape=(window_size, 1)))
model.add(Dense(1))

model.compile(optimizer='adam', loss='mse')

# Train model
model.fit(X, y, epochs=50, verbose=1)

# Save model
model.save("lstm_model.h5")

print("LSTM model trained successfully")