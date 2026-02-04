import React, { useState, useEffect } from 'react';
import { appStore } from '../store/appStore';
import { expressionService } from '../services/expressionService';

function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleStateChange = (state) => {
      setHistory(state.history);
      setLoading(state.loading);
      setError(state.error);
    };
    const unsubscribe = appStore.subscribe(handleStateChange);
    
    fetchHistory();

    return unsubscribe;
  }, []);

  const fetchHistory = async () => {
    appStore.setLoading(true);
    appStore.setError(null);
    try {
      const data = await expressionService.getHistory();
      appStore.setHistory(data);
    } catch (err) {
      appStore.setError(err.message || 'Failed to load history');
    } finally {
      appStore.setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear all history?')) return;

    appStore.setLoading(true);
    appStore.setError(null);
    try {
      await expressionService.clearHistory();
      appStore.setHistory([]);
    } catch (err) {
      appStore.setError(err.message || 'Failed to clear history');
    } finally {
      appStore.setLoading(false);
    }
  };

  return (
    <div className="history-section">
      <div className="history-header">
        <h2>Calculation History</h2>
        {history.length > 0 && (
          <button onClick={handleClearHistory} className="clear-btn" disabled={loading}>
            Clear History
          </button>
        )}
      </div>

      {error && <div className="error">{error}</div>}
      {loading && <div className="loading">Loading...</div>}

      {history.length === 0 && !loading ? (
        <p className="empty-message">No calculations yet</p>
      ) : (
        <ul className="history-list">
          {history.map((item) => (
            <li key={item.id} className="history-item">
              <div className="history-expression">{item.expressionText}</div>
              <div className="history-result">{item.result}</div>
              <div className="history-time">
                {new Date(item.computedTime).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default HistoryPage;
