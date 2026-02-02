import React, { useState, useEffect } from 'react';
import './WeatherForecast.css';
import { weatherService } from '../services/weatherService';

function WeatherForecast() {
  const [forecast, setForecast] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('forecast');

  useEffect(() => {
    fetchForecast();
  }, []);

  const fetchForecast = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await weatherService.getForecast();
      setForecast(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await weatherService.getHistory(100);
      setHistory(data);
      setActiveTab('history');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to clear all history?')) {
      try {
        await weatherService.clearHistory();
        setHistory([]);
        alert('History cleared successfully');
      } catch (err) {
        setError(err.message);
      }
    }
  };

  return (
    <div className="weather-container">
      <h1>Weather Forecast App</h1>
      
      <div className="tabs">
        <button 
          className={`tab-button ${activeTab === 'forecast' ? 'active' : ''}`}
          onClick={() => setActiveTab('forecast')}
        >
          Forecast
        </button>
        <button 
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={fetchHistory}
        >
          History
        </button>
      </div>

      {error && <div className="error">{error}</div>}
      {loading && <div className="loading">Loading...</div>}

      {activeTab === 'forecast' && (
        <div className="forecast-section">
          <button onClick={fetchForecast} disabled={loading}>
            Refresh Forecast
          </button>
          <div className="forecast-grid">
            {forecast.map((item, index) => (
              <div key={index} className="forecast-card">
                <h3>{item.date}</h3>
                <p className="temp-c">
                  {item.temperatureC}°C
                </p>
                <p className="temp-f">
                  {item.temperatureF}°F
                </p>
                <p className="summary">{item.summary}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="history-section">
          <button onClick={handleClearHistory} className="clear-btn">
            Clear History
          </button>
          <table className="history-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Temperature (°C)</th>
                <th>Temperature (°F)</th>
                <th>Summary</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id}>
                  <td>{new Date(item.requestTime).toLocaleString()}</td>
                  <td>{item.temperatureC}°C</td>
                  <td>{item.temperatureF}°F</td>
                  <td>{item.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {history.length === 0 && <p className="empty">No history available</p>}
        </div>
      )}
    </div>
  );
}

export default WeatherForecast;
