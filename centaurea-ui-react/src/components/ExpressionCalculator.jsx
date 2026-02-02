import React, { useState, useEffect } from 'react';
import './ExpressionCalculator.css';
import { expressionService, OperationType, OperationSymbols, OperationNames } from '../services/expressionService';

function ExpressionCalculator() {
  const [samples, setSamples] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('calculator');
  
  // Calculator state
  const [firstOperand, setFirstOperand] = useState('');
  const [secondOperand, setSecondOperand] = useState('');
  const [operation, setOperation] = useState(OperationType.Addition);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchSamples();
  }, []);

  const fetchSamples = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await expressionService.getSamples();
      setSamples(data);
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
      const data = await expressionService.getHistory(100);
      setHistory(data);
      setActiveTab('history');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculate = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    const first = parseFloat(firstOperand);
    const second = parseFloat(secondOperand);

    if (isNaN(first) || isNaN(second)) {
      setError('Please enter valid numbers');
      return;
    }

    try {
      const data = await expressionService.calculate(operation, first, second);
      setResult(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to clear all history?')) {
      try {
        await expressionService.clearHistory();
        setHistory([]);
        alert('History cleared successfully');
      } catch (err) {
        setError(err.message);
      }
    }
  };

  return (
    <div className="expression-container">
      <h1>Expression Calculator</h1>
      
      <div className="tabs">
        <button 
          className={`tab-button ${activeTab === 'calculator' ? 'active' : ''}`}
          onClick={() => setActiveTab('calculator')}
        >
          Calculator
        </button>
        <button 
          className={`tab-button ${activeTab === 'samples' ? 'active' : ''}`}
          onClick={() => { setActiveTab('samples'); fetchSamples(); }}
        >
          Samples
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

      {activeTab === 'calculator' && (
        <div className="calculator-section">
          <form onSubmit={handleCalculate} className="calculator-form">
            <div className="form-group">
              <label>First Operand:</label>
              <input
                type="number"
                step="any"
                value={firstOperand}
                onChange={(e) => setFirstOperand(e.target.value)}
                placeholder="Enter first number"
                required
              />
            </div>

            <div className="form-group">
              <label>Operation:</label>
              <select
                value={operation}
                onChange={(e) => setOperation(parseInt(e.target.value))}
              >
                {Object.entries(OperationNames).map(([key, name]) => (
                  <option key={key} value={key}>
                    {name} ({OperationSymbols[key]})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Second Operand:</label>
              <input
                type="number"
                step="any"
                value={secondOperand}
                onChange={(e) => setSecondOperand(e.target.value)}
                placeholder="Enter second number"
                required
              />
            </div>

            <button type="submit" className="calculate-btn">
              Calculate
            </button>
          </form>

          {result && (
            <div className="result-card">
              <h2>Result</h2>
              <p className="expression-string">{result.expressionString}</p>
              <div className="result-details">
                <p><strong>Operation:</strong> {OperationNames[result.operation]}</p>
                <p><strong>Result:</strong> {result.result}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'samples' && (
        <div className="samples-section">
          <button onClick={fetchSamples} disabled={loading}>
            Refresh Samples
          </button>
          <div className="samples-grid">
            {samples.map((item, index) => (
              <div key={index} className="sample-card">
                <h3>{OperationNames[item.operation]}</h3>
                <p className="expression">
                  {item.firstOperand} {item.operationSymbol} {item.secondOperand}
                </p>
                <p className="result">
                  = {item.result}
                </p>
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
                <th>Operation</th>
                <th>First</th>
                <th>Second</th>
                <th>Result</th>
                <th>User</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id}>
                  <td>{new Date(item.computedTime).toLocaleString()}</td>
                  <td>{OperationNames[item.operation]}</td>
                  <td>{item.firstOperand}</td>
                  <td>{item.secondOperand}</td>
                  <td><strong>{item.result}</strong></td>
                  <td>{item.userIdentifier}</td>
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

export default ExpressionCalculator;
