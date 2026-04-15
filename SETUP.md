# AAT Hackathon - Full Setup Guide

## Architecture Overview

```
Arduino (DHT11) → Serial Port → Node.js Backend → MongoDB Atlas → React Frontend
```

---

## Step 1: MongoDB Atlas Setup

### 1.1 Create MongoDB Atlas Account & Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new project "AAT-Dashboard"
4. Create a free cluster (M0)
5. Choose AWS region closest to you
6. Wait for cluster to be ready (~10 mins)

### 1.2 Create Database User

1. Go to **Security** → **Database Access**
2. Click **Add New Database User**
3. Username: `aat_user`
4. Password: (generate strong password, copy it)
5. Database: `aat_dashboard`
6. Permissions: **Read and write to any database**
7. Click **Add User**

### 1.3 Get Connection String

1. Go to **Deployment** → **Databases**
2. Click **Connect** for your cluster
3. Choose **Drivers** → **Node.js**
4. Copy the connection string
5. Replace `<password>` with your database user password

Example:

```
mongodb+srv://aat_user:PASSWORD@cluster0.xxxxx.mongodb.net/aat_dashboard?retryWrites=true&w=majority
```

---

## Step 2: Configure Backend Environment

### 2.1 Update `.env` file

```bash
# Edit: server/.env or root .env
MONGODB_URI=mongodb+srv://aat_user:PASSWORD@cluster0.xxxxx.mongodb.net/aat_dashboard
DATABASE_NAME=aat_dashboard
PORT=3001
ENABLE_ARDUINO=true
ARDUINO_PORT=COM3
```

### 2.2 Install Dependencies

```bash
npm install
```

This installs:

- `mongodb` - Database driver
- `serialport` - Arduino communication
- Other dependencies

---

## Step 3: Arduino Configuration

### 3.1 Arduino Sketch

Upload this sketch to your Arduino:

```cpp
#include "DHT.h"

#define DHTPIN 2     // Data pin (change if needed)
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();
  delay(2000); // DHT sensor stabilization
}

void loop() {
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();

  if (!isnan(temperature) && !isnan(humidity)) {
    // Send as JSON
    Serial.print("{\"temperature\":");
    Serial.print(temperature);
    Serial.print(",\"humidity\":");
    Serial.print(humidity);
    Serial.println("}");
  }

  delay(5000); // Send every 5 seconds
}
```

### 3.2 Identify Arduino Port

- **Windows**: COM3, COM4, etc. (check Device Manager)
- **Linux**: /dev/ttyUSB0, /dev/ttyACM0
- **macOS**: /dev/cu.usbserial-\*

Update `ARDUINO_PORT` in `.env`

---

## Step 4: Run the Application

### 4.1 Start Backend Server

```bash
npm run dev:server
```

Expected output:

```
✓ Connected to MongoDB Atlas
✓ Indexes created successfully
✓ Arduino connected on COM3
🚀 Backend listening on http://localhost:3001
📡 Real-time data collection from Arduino enabled
```

### 4.2 Start Frontend (New Terminal)

```bash
npm run dev
```

Expected output:

```
  VITE v8.0.4  ready in 1234 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### 4.3 Open Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api/temperature/live

---

## Step 5: Verify Data Flow

### 5.1 Check Backend Logs

```
📊 Arduino data: { temperature: 28.5, humidity: 65 }
💾 Saved to MongoDB: { temp: 28.5, humidity: 65, id: ... }
```

### 5.2 Check Frontend

- Live temperature should update every 15 seconds
- Chart should show historical data
- Dashboard cards should display current readings

### 5.3 Test API Manually

```bash
# Get live temperature
curl http://localhost:3001/api/temperature/live

# Get 24h history
curl http://localhost:3001/api/temperature/history?range=24h

# Get statistics
curl http://localhost:3001/api/temperature/stats?range=24h

# Save test data
curl -X POST http://localhost:3001/api/temperature \
  -H "Content-Type: application/json" \
  -d '{"temperature": 25.5, "humidity": 60, "location": "Lab"}'
```

---

## Troubleshooting

### MongoDB Connection Failed

❌ `ECONNREFUSED: 127.0.0.1:27017`

- **Fix**: Make sure you're using MongoDB Atlas connection string, not localhost
- **Check**: MONGODB_URI starts with `mongodb+srv://`

### Arduino Not Found

❌ `Error: No such file or device`

- **Fix**: Check COM port in Device Manager (Windows) or `ls /dev/ttyUSB*` (Linux)
- **Update**: ARDUINO_PORT in `.env`
- **Fallback**: Disable Arduino with `ENABLE_ARDUINO=false`

### Data Not Appearing in Dashboard

❌ Live temperature shows 0°C

- **Check**: Arduino is sending JSON format: `{"temperature": X, "humidity": Y}`
- **Check**: Backend shows "Arduino data" log messages
- **Check**: Frontend is using real API (VITE_USE_MOCK_API=false in .env.local)

### CORS Errors

❌ `Access to XMLHttpRequest blocked by CORS`

- **Fix**: Backend has CORS enabled for `*` origin
- **Check**: Frontend is accessing correct backend URL (localhost:3001)

---

## Data Storage Schema (MongoDB)

### Collection: `temperature_buckets`

```javascript
{
  _id: ObjectId,
  timestamp: Date,           // ISO timestamp
  value: Number,            // Temperature in °C
  humidity: Number,         // Humidity percentage
  metadata: {
    location: String,       // "Lab", "Office", etc.
    source: String,         // "Arduino DHT11"
    deviceId: String        // "DHT11-001"
  }
}
```

**Features:**

- ✅ Time-series optimized
- ✅ Auto-expires data after 90 days (TTL index)
- ✅ Indexed by location & timestamp
- ✅ Supports efficient range queries

---

## API Endpoints

| Method | Endpoint                             | Description                     |
| ------ | ------------------------------------ | ------------------------------- |
| GET    | `/api/temperature/live`              | Current temperature & humidity  |
| GET    | `/api/temperature/history?range=24h` | Historical data (24h, 7d, 30d)  |
| GET    | `/api/temperature/stats?range=24h`   | Min/max/avg temperature         |
| POST   | `/api/temperature`                   | Save new reading (for API mode) |

---

## Environment Variables Reference

### Backend (.env)

```
MONGODB_URI          = MongoDB Atlas connection string
DATABASE_NAME        = Database name (default: aat_dashboard)
PORT                 = Server port (default: 3001)
ENABLE_ARDUINO       = true/false to enable/disable Arduino connection
ARDUINO_PORT         = COM port for Arduino (default: COM3)
NODE_ENV             = development/production
```

### Frontend (.env.local)

```
VITE_API_BASE_URL    = Backend URL (default: http://localhost:3001)
VITE_USE_MOCK_API    = true/false to use mock or real API
```

---

## Next Steps

- [ ] Set up MongoDB Atlas account
- [ ] Create cluster and database user
- [ ] Get connection string
- [ ] Update .env with MONGODB_URI
- [ ] Upload Arduino sketch
- [ ] Start backend: `npm run dev:server`
- [ ] Start frontend: `npm run dev`
- [ ] Verify data flow in logs and dashboard
- [ ] Deploy to cloud (Azure Functions, Heroku, etc.)

---

## Architecture Decisions

### Why MongoDB Atlas for Time-Series?

- ✅ Elastic scaling for variable IoT load
- ✅ Global distribution for low latency
- ✅ Built-in time-series collections (automatic bucketing)
- ✅ TTL indexes for automatic cleanup
- ✅ Free tier (M0 cluster, 512MB storage)

### Why Bucket Pattern?

- Efficient storage of frequent readings
- Reduces document count
- Optimized for time-range queries
- Better for historical analysis

### Why Serial Port for Arduino?

- Simple direct communication
- No WiFi modul required
- Good for development/testing
- Can be replaced with WiFi later

---

## Support & Resources

- MongoDB Docs: https://docs.mongodb.com
- Arduino DHT11: https://github.com/adafruit/DHT-sensor-library
- Node.js Serial Port: https://serialport.io/
