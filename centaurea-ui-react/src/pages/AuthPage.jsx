import React, { useState, useEffect } from 'react';
import { appStore } from '../store/appStore';
import { authService } from '../services/authService';

function AuthPage() {
  const [authMode, setAuthMode] = useState('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleStateChange = (state) => {
      setError(state.error);
      setLoading(state.loading);
    };
    const unsubscribe = appStore.subscribe(handleStateChange);
    return unsubscribe;
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    appStore.setError(null);
    appStore.setLoading(true);
    try {
      const response = await authService.register(name, email, password);
      // Store token and user after registration
      authService.setAuth(response.token, response.user);
      appStore.setUser(response.user);
      setName('');
      setEmail('');
      setPassword('');
    } catch (err) {
      appStore.setError(err.message || 'Registration failed');
    } finally {
      appStore.setLoading(false);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    appStore.setError(null);
    appStore.setLoading(true);
    try {
      const user = await authService.signIn(email, password);
      appStore.setUser(user);
      setEmail('');
      setPassword('');
    } catch (err) {
      appStore.setError(err.message || 'Sign in failed');
    } finally {
      appStore.setLoading(false);
    }
  };

  return (
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

      {error && <div className="error">{error}</div>}
      {loading && <div className="loading">Loading...</div>}

      {authMode === 'register' ? (
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
          <button type="submit" className="calculate-btn" disabled={loading}>
            Register
          </button>
        </form>
      ) : (
        <form onSubmit={handleSignIn} className="auth-form">
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
          <button type="submit" className="calculate-btn" disabled={loading}>
            Sign in
          </button>
        </form>
      )}
    </div>
  );
}

export default AuthPage;
