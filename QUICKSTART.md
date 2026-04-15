# Quick Start - MongoDB + Arduino Integration

## 1️⃣ MongoDB Atlas (3 mins)

```bash
# 1. Go to mongodb.com/cloud/atlas
# 2. Create free M0 cluster
# 3. Create user: aat_user / strong_password
# 4. Get connection string: mongodb+srv://aat_user:PASSWORD@cluster0.xxxxx.mongodb.net
```

## 2️⃣ Configure Backend

```bash
# Update root .env
MONGODB_URI=mongodb+srv://aat_user:PASSWORD@cluster0.xxxxx.mongodb.net/aat_dashboard
ENABLE_ARDUINO=true
ARDUINO_PORT=COM3
```

## 3️⃣ Install & Run

```bash
# Install dependencies
npm install

# Terminal 1: Start backend
npm run dev:server
# ✓ Shows: "Connected to MongoDB Atlas" + "Arduino connected on COM3"

# Terminal 2: Start frontend
npm run dev
# ✓ Open http://localhost:5173
```

## 4️⃣ Arduino Setup (Optional)

Upload to your Arduino:

```cpp
#include "DHT.h"
DHT dht(2, DHT11);  // Pin 2

void setup() {
  Serial.begin(115200);
  dht.begin();
}

void loop() {
  float t = dht.readTemperature();
  float h = dht.readHumidity();
  Serial.println("{\"temperature\":" + String(t) + ",\"humidity\":" + String(h) + "}");
  delay(5000);
}
```

## ✅ Verify It Works

**In backend logs:**

```
📊 Arduino data: { temperature: 28.5, humidity: 65 }
💾 Saved to MongoDB: { temp: 28.5, humidity: 65 }
```

**In frontend:**

- Live temperature updates every 15s
- Chart shows historical data
- Statistics display min/max/avg

## 🛠️ Troubleshooting

| Problem                  | Solution                                     |
| ------------------------ | -------------------------------------------- |
| MongoDB connection fails | Check MONGODB_URI has `mongodb+srv://`       |
| Arduino not found        | Find COM port in Device Manager, update .env |
| No data in dashboard     | Check VITE_USE_MOCK_API=false in .env.local  |
| CORS errors              | Backend has CORS enabled, check frontend URL |

## 📍 Database Structure

**Collection:** `temperature_buckets`

```json
{
  "timestamp": "2025-04-15T10:30:00Z",
  "value": 28.5,
  "humidity": 65,
  "metadata": {
    "location": "Lab",
    "source": "Arduino DHT11",
    "deviceId": "DHT11-001"
  }
}
```

## 🔌 API Endpoints

```
GET  /api/temperature/live          → Current reading
GET  /api/temperature/history?range=24h → Last 24 hours
GET  /api/temperature/stats?range=24h   → Min/max/avg
POST /api/temperature               → Save new reading
```

## 📚 Full Setup Guide

See [SETUP.md](SETUP.md) for detailed instructions.
