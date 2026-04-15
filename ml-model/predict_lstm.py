import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'  # Suppress TF logs

import sys
import json
import numpy as np
from tensorflow.keras.models import load_model

try:
    base_dir = os.path.dirname(__file__)
    model_path = os.path.join(base_dir, "lstm_model.h5")

    model = load_model(model_path, compile=False)

    data = json.loads(sys.argv[1])

    if not isinstance(data, list) or len(data) < 3:
        print("Error: Need at least 3 values")
        sys.exit()

    input_data = np.array(data[-3:], dtype=float)
    input_data = input_data.reshape((1, 3, 1))

    prediction = model.predict(input_data, verbose=0)

    # IMPORTANT: print ONLY number
    print(float(prediction[0][0]))

except Exception as e:
    print("Error:", str(e))