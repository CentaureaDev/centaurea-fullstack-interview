# Centaurea Fullstack - UI Subprojects

This directory contains two UI implementations for the Centaurea Weather Forecast API:

## React UI (`centaurea-ui-react`)

A React-based frontend using Create React App.

### Features
- Weather forecast display with 5-day forecast
- Request history tracking
- Clear history functionality
- Responsive grid layout
- Tab-based navigation

### Setup

```bash
cd centaurea-ui-react
npm install
```

### Development

```bash
npm start
```

The app will open at `http://localhost:3000`

### Environment Variables

Create a `.env` file or update the existing one:

```env
REACT_APP_API_URL=http://localhost:5034/api
```

### Build for Production

```bash
npm run build
```

---

## Vue3 UI (`centaurea-ui-vue3`)

A Vue3-based frontend using Vite.

### Features
- Weather forecast display with 5-day forecast
- Request history tracking
- Clear history functionality
- Responsive grid layout
- Tab-based navigation
- Modern Vue3 composition API

### Setup

```bash
cd centaurea-ui-vue3
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or another port if 5173 is in use)

### Environment Variables

Create a `.env` file or update the existing one:

```env
VITE_API_URL=http://localhost:5034/api
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

---

## API Integration

Both UIs consume the following endpoints from the backend API:

- `GET /api/weatherforecast` - Get 5-day weather forecast
- `GET /api/weatherforecast/history?limit=100` - Get request history
- `DELETE /api/weatherforecast/history` - Clear all history

### API Response Format

**Forecast Response:**
```json
[
  {
    "date": "2026-02-03",
    "temperatureC": 15,
    "temperatureF": 59,
    "summary": "Mild"
  }
]
```

**History Response:**
```json
[
  {
    "id": 1,
    "requestTime": "2026-02-02T10:30:00Z",
    "temperatureC": 20,
    "temperatureF": 68,
    "summary": "Warm"
  }
]
```

---

## Running Both UIs Simultaneously

### Terminal 1 - Backend API
```bash
cd CentaureaAPI
dotnet run
# Runs on http://localhost:5034
```

### Terminal 2 - React UI
```bash
cd centaurea-ui-react
npm start
# Runs on http://localhost:3000
```

### Terminal 3 - Vue3 UI
```bash
cd centaurea-ui-vue3
npm run dev
# Runs on http://localhost:5173
```

---

## Project Structure

### React Structure
```
centaurea-ui-react/
├── src/
│   ├── components/
│   │   ├── WeatherForecast.jsx
│   │   └── WeatherForecast.css
│   ├── services/
│   │   └── weatherService.js
│   ├── App.js
│   └── index.js
└── .env
```

### Vue3 Structure
```
centaurea-ui-vue3/
├── src/
│   ├── components/
│   │   └── WeatherForecast.vue
│   ├── services/
│   │   └── weatherService.js
│   ├── App.vue
│   └── main.js
└── .env
```

---

## Troubleshooting

### React App Won't Load API Data
- Ensure the backend API is running on `http://localhost:5034`
- Check that `REACT_APP_API_URL` is correctly set in `.env`
- Check browser console for CORS or network errors

### Vue3 App Won't Load API Data
- Ensure the backend API is running on `http://localhost:5034`
- Check that `VITE_API_URL` is correctly set in `.env`
- Check browser console for CORS or network errors

### CORS Errors
If you see CORS errors, the backend API needs to be configured to allow requests from the UI origins. This may require adding CORS middleware to the ASP.NET Core backend.

---

## Technology Stack

### React
- React 18.x
- Create React App
- Fetch API for HTTP requests

### Vue3
- Vue 3.x
- Vite
- Composition API
- Fetch API for HTTP requests

Both projects use modern ES6+ JavaScript and responsive CSS for a great user experience.
