import os

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

import numpy as np
import pandas as pd
from pymongo import MongoClient
from tensorflow.keras.layers import LSTM, Dense
from tensorflow.keras.models import Sequential


def load_temperatures(base_dir):
    mongodb_uri = os.getenv('MONGODB_URI')
    database_name = os.getenv('DATABASE_NAME', 'aat_dashboard')

    if mongodb_uri:
        try:
            client = MongoClient(mongodb_uri, serverSelectionTimeoutMS=5000)
            db = client[database_name]

            for collection_name in ['temperature_buckets', 'temperature']:
                records = list(db[collection_name].find().sort('timestamp', 1))
                if not records:
                    continue

                temps = []
                for record in records:
                    if 'value' in record:
                        temps.append(float(record['value']))
                    elif 'temperature' in record:
                        temps.append(float(record['temperature']))

                if len(temps) >= 4:
                    return np.array(temps, dtype=float)
        except Exception as error:
            print(f"MongoDB unavailable, falling back to dataset.csv: {error}")

    dataset_path = os.path.join(base_dir, 'dataset.csv')
    dataset = pd.read_csv(dataset_path)

    if 'temperature' not in dataset.columns:
        raise ValueError("dataset.csv must contain a 'temperature' column")

    temps = dataset['temperature'].dropna().astype(float).to_numpy()
    if len(temps) < 4:
        raise ValueError('Need at least 4 temperature values to train the model')

    return temps


base_dir = os.path.dirname(__file__)
temps = load_temperatures(base_dir)

window_size = 3
X = []
y = []

for i in range(len(temps) - window_size):
    X.append(temps[i : i + window_size])
    y.append(temps[i + window_size])

X = np.array(X, dtype=float)
y = np.array(y, dtype=float)
X = X.reshape((X.shape[0], X.shape[1], 1))

model = Sequential()
model.add(LSTM(50, activation='relu', input_shape=(window_size, 1)))
model.add(Dense(1))
model.compile(optimizer='adam', loss='mse')

model.fit(X, y, epochs=50, verbose=1)

model_path = os.path.join(base_dir, 'lstm_model.h5')
model.save(model_path)

print(f"LSTM model trained successfully and saved to {model_path}")
