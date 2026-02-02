const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5034/api';

export const weatherService = {
  async getForecast() {
    const response = await fetch(`${API_URL}/weatherforecast`);
    if (!response.ok) throw new Error('Failed to fetch forecast');
    return response.json();
  },

  async getHistory(limit = 100) {
    const response = await fetch(`${API_URL}/weatherforecast/history?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch history');
    return response.json();
  },

  async clearHistory() {
    const response = await fetch(`${API_URL}/weatherforecast/history`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to clear history');
    return response.json();
  },
};
