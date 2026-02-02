<template>
  <div class="weather-container">
    <h1>Weather Forecast App (Vue3)</h1>

    <div class="tabs">
      <button
        class="tab-button"
        :class="{ active: activeTab === 'forecast' }"
        @click="activeTab = 'forecast'"
      >
        Forecast
      </button>
      <button
        class="tab-button"
        :class="{ active: activeTab === 'history' }"
        @click="fetchHistory"
      >
        History
      </button>
    </div>

    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="loading" class="loading">Loading...</div>

    <div v-if="activeTab === 'forecast'" class="forecast-section">
      <button @click="fetchForecast" :disabled="loading">
        Refresh Forecast
      </button>
      <div class="forecast-grid">
        <div v-for="(item, index) in forecast" :key="index" class="forecast-card">
          <h3>{{ item.date }}</h3>
          <p class="temp-c">{{ item.temperatureC }}°C</p>
          <p class="temp-f">{{ item.temperatureF }}°F</p>
          <p class="summary">{{ item.summary }}</p>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'history'" class="history-section">
      <button @click="handleClearHistory" class="clear-btn">
        Clear History
      </button>
      <table v-if="history.length > 0" class="history-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Temperature (°C)</th>
            <th>Temperature (°F)</th>
            <th>Summary</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in history" :key="item.id">
            <td>{{ formatDate(item.requestTime) }}</td>
            <td>{{ item.temperatureC }}°C</td>
            <td>{{ item.temperatureF }}°F</td>
            <td>{{ item.summary }}</td>
          </tr>
        </tbody>
      </table>
      <p v-else class="empty">No history available</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { weatherService } from '../services/weatherService';

const forecast = ref([]);
const history = ref([]);
const loading = ref(false);
const error = ref(null);
const activeTab = ref('forecast');

const fetchForecast = async () => {
  loading.value = true;
  error.value = null;
  try {
    const data = await weatherService.getForecast();
    forecast.value = data;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const fetchHistory = async () => {
  loading.value = true;
  error.value = null;
  try {
    const data = await weatherService.getHistory(100);
    history.value = data;
    activeTab.value = 'history';
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const handleClearHistory = async () => {
  if (window.confirm('Are you sure you want to clear all history?')) {
    try {
      await weatherService.clearHistory();
      history.value = [];
      alert('History cleared successfully');
    } catch (err) {
      error.value = err.message;
    }
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString();
};

onMounted(() => {
  fetchForecast();
});
</script>

<style scoped>
.weather-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
}

.weather-container h1 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
}

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  border-bottom: 2px solid #e0e0e0;
}

.tab-button {
  padding: 10px 20px;
  border: none;
  background-color: transparent;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  color: #666;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
}

.tab-button:hover {
  color: #333;
}

.tab-button.active {
  color: #42b983;
  border-bottom-color: #42b983;
}

.error {
  padding: 15px;
  margin-bottom: 20px;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  color: #721c24;
}

.loading {
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: #666;
}

.forecast-section,
.history-section {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.forecast-section button,
.history-section button {
  padding: 10px 20px;
  margin-bottom: 20px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

.forecast-section button:hover,
.history-section button:hover {
  background-color: #359268;
}

.forecast-section button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.clear-btn {
  background-color: #dc3545;
}

.clear-btn:hover {
  background-color: #c82333;
}

.forecast-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.forecast-card {
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: linear-gradient(135deg, #42b983 0%, #359268 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.forecast-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.forecast-card h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 16px;
  font-weight: 600;
}

.forecast-card .temp-c,
.forecast-card .temp-f {
  font-size: 24px;
  margin: 10px 0;
  font-weight: bold;
}

.forecast-card .summary {
  font-size: 14px;
  margin-bottom: 0;
  opacity: 0.9;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.history-table thead {
  background-color: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
}

.history-table th {
  padding: 15px;
  text-align: left;
  font-weight: 600;
  color: #333;
}

.history-table td {
  padding: 12px 15px;
  border-bottom: 1px solid #dee2e6;
}

.history-table tbody tr:hover {
  background-color: #f8f9fa;
}

.empty {
  text-align: center;
  padding: 40px;
  color: #999;
  font-style: italic;
}
</style>
