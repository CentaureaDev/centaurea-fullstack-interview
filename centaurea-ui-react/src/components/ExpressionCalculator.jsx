import React, { useEffect, useState } from 'react';
import './ExpressionCalculator.css';
import { expressionService, OperationType, OperationSymbols, OperationNames } from '../services/expressionService';
import { authService } from '../services/authService';

function ExpressionCalculator() {
  const [samples, setSamples] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(authService.getUser() ? 'calculator' : 'auth');
  const [authMode, setAuthMode] = useState('signin');
  const [currentUser, setCurrentUser] = useState(authService.getUser());
  const isAuthenticated = Boolean(currentUser);

  // Auth form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Calculator state
  const [firstOperand, setFirstOperand] = useState('');
  const [secondOperand, setSecondOperand] = useState('');
  const [operation, setOperation] = useState(OperationType.Addition);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSamples();
      if (activeTab === 'auth') {
        setActiveTab('calculator');
      }
    } else {
      setActiveTab('auth');
    }
  }, [isAuthenticated]);

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
    if (!currentUser) {
      setActiveTab('auth');
      setError('Please sign in to view history');
      return;
    }

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

    if (!currentUser) {
      setActiveTab('auth');
      setError('Please sign in to calculate expressions');
      return;
    }

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

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await authService.register(name, email, password);
      authService.setAuth(data.token, data.user);
      setCurrentUser(data.user);
      setActiveTab('calculator');
      setName('');
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await authService.login(email, password);
      authService.setAuth(data.token, data.user);
      setCurrentUser(data.user);
      setActiveTab('calculator');
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    authService.clearAuth();
    setCurrentUser(null);
    setActiveTab('auth');
  };

  return (
    <div className="expression-container">
      <div className="header-row">
        <h1>Expression Calculator</h1>
        {currentUser && (
          <div className="user-badge">
            <div>
              <div className="user-name">{currentUser.name}</div>
              <div className="user-email">{currentUser.email}</div>
            </div>
            <button className="signout-btn" onClick={handleSignOut}>Sign out</button>
          </div>
        )}
      </div>

      {error && <div className="error">{error}</div>}
      {loading && <div className="loading">Loading...</div>}

      {!isAuthenticated && (
        <div className="auth-section">
          <div className="auth-toggle">
            <button
              className={`toggle-btn ${authMode === 'signin' ? 'active' : ''}`}
              onClick={() => setAuthMode('signin')}
            >
              Sign in
            </button>
            <button
              className={`toggle-btn ${authMode === 'register' ? 'active' : ''}`}
              onClick={() => setAuthMode('register')}
            >
              Register
            </button>
          </div>

          {authMode === 'register' && (
            <form onSubmit={handleRegister} className="auth-form">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  required
                />
              </div>
              <button type="submit" className="calculate-btn">Register</button>
            </form>
          )}

          {authMode === 'signin' && (
            <form onSubmit={handleLogin} className="auth-form">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  required
                />
              </div>
              <button type="submit" className="calculate-btn">Sign in</button>
            </form>
          )}
        </div>
      )}

      {isAuthenticated && (
        <>
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
                  <td>{item.userEmail}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {history.length === 0 && <p className="empty">No history available</p>}
        </div>
      )}
        </>
      )}
    </div>
  );
}

export default ExpressionCalculator;
