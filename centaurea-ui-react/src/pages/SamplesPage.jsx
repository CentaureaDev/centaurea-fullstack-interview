import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { appStore } from '../store/appStore';
import { authService } from '../services/authService';
import { expressionService } from '../services/expressionService';

function SamplesPage() {
  const navigate = useNavigate();
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

  const handleSignOutAndRedirect = () => {
    authService.signOut();
    appStore.setUser(null);
    appStore.setRedirectMessage('Your session has expired. Please sign in again.');
    navigate('/auth');
  };

  const fetchSamples = async () => {
    appStore.setLoading(true);
    appStore.setError(null);
    try {
      const data = await expressionService.getSamples();
      appStore.setSamples(data);
    } catch (err) {
      if (err.status === 401) {
        handleSignOutAndRedirect();
      } else {
        appStore.setError(err.message || 'Failed to load samples');
      }
    } finally {
      appStore.setLoading(false);
    }
  };

  return (
    <div className="section">
      <div className="section__header">
        <h2 className="section__title">Sample Expressions</h2>
        <div className="grid__buttons">
          <button type="button" className="button button--primary" onClick={fetchSamples} disabled={loading}>
            Refresh
          </button>
        </div>
      </div>

      {error && <div className="message message--error">{error}</div>}
      {loading && <div className="message message--loading">Loading...</div>}

      {samples.length === 0 && !loading ? (
        <p className="message message--empty">No sample expressions available</p>
      ) : (
        <ul className="list list--items">
          {samples.map((item) => (
            <li key={item.id} className="card--item">
              <div className="card--item__expression">{item.expressionText}</div>
              <div className="card--item__result">{item.result}</div>
              <div className="card--item__time">
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
