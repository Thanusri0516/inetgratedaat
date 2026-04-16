# AAT Temperature Dashboard

A full-stack temperature monitoring dashboard for an ESP32/Arduino + DHT11 sensor setup.

The project reads live sensor data from the serial port, stores it in MongoDB Atlas, shows it in a React dashboard, and answers simple temperature questions through a built-in chatbot.

## Features

- Live temperature and humidity from Arduino/ESP32
- MongoDB Atlas storage for sensor readings
- Trend chart for recent temperature history
- Simple next-hour forecast
- Chatbot for questions like `What is the temperature?`, `Is it hot?`, and `What is the forecast?`
- Frontend built with React + Vite
- Backend built with Node.js and the MongoDB driver

## Architecture

```text
ESP32 / Arduino + DHT11
        ->
Serial Port (COMx)
        ->
Node.js backend
        ->
MongoDB Atlas
        ->
React dashboard + chatbot
```

## Project Structure

```text
src/                  Frontend app
server/               Backend API, MongoDB, serial ingestion
ml-model/             Python forecasting scripts
public/               Static assets
seed-data.js          Optional mock data seeding script
SETUP.md              Extended setup notes
```

## Requirements

- Node.js 22 or newer
- npm
- MongoDB Atlas project and database user
- Arduino IDE
- ESP32/Arduino board with DHT11 sensor

## Environment Variables

Create a root `.env` file:

```env
MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/aat_dashboard?retryWrites=true&w=majority
DATABASE_NAME=aat_dashboard
PORT=3000
NODE_ENV=development
ENABLE_ARDUINO=true
ARDUINO_PORT=COM8
ARDUINO_BAUD_RATE=115200
```

Create `.env.local` for the frontend:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_USE_MOCK_API=false
```

## MongoDB Atlas Setup

1. Create a cluster in MongoDB Atlas.
2. Create a database user with read/write access.
3. Copy the connection string into `.env`.
4. In `Network Access`, add your current IP address.

If Atlas is not allowlisting your IP, the backend may fail with TLS or connection errors while trying to save Arduino data.

## Arduino Output Format

The backend accepts either JSON output or the plain text format below.

Preferred JSON format:

```cpp
Serial.print("{\"temperature\":");
Serial.print(temp);
Serial.print(",\"humidity\":");
Serial.print(humid);
Serial.println("}");
```

Also supported:

```text
Temperature: 32.9 °C | Humidity: 60.3 %
```

Use baud rate `115200`.

## Install

```bash
npm install
```

## Run Locally

Open two terminals in the project root.

Terminal 1:

```bash
npm run dev:server
```

Terminal 2:

```bash
npm run dev
```

Open:

- Frontend: `http://localhost:5173`
- Dashboard: `http://localhost:5173/dashboard`
- Backend API: `http://localhost:3000`

## Important Serial Port Note

Only one app can use the Arduino serial port at a time.

Before starting the backend:

- close the Arduino IDE `Serial Monitor`
- keep the board connected
- make sure `ARDUINO_PORT` matches the correct COM port

If the backend prints `Access denied` for `COM8`, it usually means Arduino IDE Serial Monitor is still open.

## API Endpoints

- `GET /api/temperature/live`
- `GET /api/temperature/history?range=1h|6h|24h|1w`
- `GET /api/temperature/stats?range=1h|6h|24h|1w`
- `GET /api/temperature/predicted`
- `POST /api/temperature`
- `POST /api/chatbot`

## Chatbot

The chatbot uses live backend data from MongoDB and can answer:

- `What is the temperature?`
- `Is it hot?`
- `What is the humidity?`
- `What is the forecast?`
- `What is the high?`
- `What is the low?`
- `How is the room?`

If no live reading is available yet, it will tell you that sensor data is not ready.

## Build

```bash
npm run build
npm run preview
```

## Troubleshooting

### MongoDB TLS / connection errors

Example:

```text
MongoDB connection failed: tlsv1 alert internal error
```

Try these:

- add your current IP in MongoDB Atlas `Network Access`
- verify your MongoDB username and password
- double-check `MONGODB_URI` in `.env`
- restart the backend after changing Atlas settings
- if SRV connection keeps failing, try the non-SRV `mongodb://...` connection string from Atlas

### Serial port access denied

Example:

```text
Arduino pipeline did not start: Opening COM8: Access denied
```

Fix:

- close Arduino IDE Serial Monitor
- check the correct COM port in Device Manager
- restart the backend

### Frontend loads but no live data appears

Check:

- backend is running on `http://localhost:3000`
- `.env.local` has `VITE_API_BASE_URL=http://localhost:3000`
- MongoDB is connected
- Arduino is sending data

## Notes

- The backend starts even if Arduino is unavailable, but live ingestion will not work until the serial port is free.
- The chatbot, live card, and forecast depend on backend data being stored successfully.
- `SETUP.md` contains additional setup guidance if you want a more detailed walkthrough.
