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
```
## MongoDB Atlas Setup

1. Create a cluster in MongoDB Atlas.
2. Create a database user with read/write access.
3. Copy the connection string into `.env`.
4. In `Network Access`, add your current IP address.

If Atlas is not allowlisting your IP, the backend may fail with TLS or connection errors while trying to save Arduino data.

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

## Build

```bash
npm run build
npm run preview
```
