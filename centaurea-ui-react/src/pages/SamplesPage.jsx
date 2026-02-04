import React, { useState, useEffect } from 'react';
import { appStore } from '../store/appStore';
import { expressionService } from '../services/expressionService';

function SamplesPage() {
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleStateChange = (state) => {
      setSamples(state.samples);
      setLoading(state.loading);
      setError(state.error);
    };
    const unsubscribe = appStore.subscribe(handleStateChange);
    
    fetchSamples();

    return unsubscribe;
  }, []);

  const fetchSamples = async () => {
    appStore.setLoading(true);
    appStore.setError(null);
    try {
      const data = await expressionService.getSamples();
      appStore.setSamples(data);
    } catch (err) {
      appStore.setError(err.message || 'Failed to load samples');
    } finally {
      appStore.setLoading(false);
    }
  };

  return (
    <div className="samples-section">
      <h2>Sample Expressions</h2>

      {error && <div className="error">{error}</div>}
      {loading && <div className="loading">Loading...</div>}

      {samples.length === 0 && !loading ? (
        <p className="empty-message">No sample expressions available</p>
      ) : (
        <ul className="samples-list">
          {samples.map((item) => (
            <li key={item.id} className="sample-item">
              <div className="sample-expression">{item.expressionText}</div>
              <div className="sample-result">{item.result}</div>
              <div className="sample-time">
                {new Date(item.computedTime).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SamplesPage;
