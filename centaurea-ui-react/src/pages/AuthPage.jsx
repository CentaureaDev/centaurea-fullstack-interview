import React, { useState, useEffect } from 'react';
import { appStore } from '../store/appStore';
import { authService } from '../services/authService';

function AuthPage() {
  const [authMode, setAuthMode] = useState('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [redirectMessage, setRedirectMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleStateChange = (state) => {
      setError(state.error);
      setRedirectMessage(state.redirectMessage);
      setLoading(state.loading);
    };
    const unsubscribe = appStore.subscribe(handleStateChange);
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (redirectMessage) {
      const timer = setTimeout(() => {
        appStore.clearRedirectMessage();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [redirectMessage]);

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
    <div className="section">
      <div className="toggle">
        <button
          className={`toggle__button${authMode === 'signin' ? ' toggle__button--active' : ''}`}
          onClick={() => setAuthMode('signin')}
        >
          Sign in
        </button>
        <button
          className={`toggle__button${authMode === 'register' ? ' toggle__button--active' : ''}`}
          onClick={() => setAuthMode('register')}
        >
          Register
        </button>
      </div>

      {redirectMessage && (
        <div className="message message--info">
          {redirectMessage}
        </div>
      )}

      {error && <div className="message message--error">{error}</div>}
      {loading && <div className="message message--loading">Loading...</div>}

      {authMode === 'register' ? (
        <form onSubmit={handleRegister} className="form form--auth">
          <div className="form__group">
            <label className="form__label">Name</label>
            <input
              className="form__input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
            />
          </div>
          <div className="form__group">
            <label className="form__label">Email</label>
            <input
              className="form__input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="form__group">
            <label className="form__label">Password</label>
            <input
              className="form__input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              required
            />
          </div>
          <button type="submit" className="button button--primary" disabled={loading}>
            Register
          </button>
        </form>
      ) : (
        <form onSubmit={handleSignIn} className="form form--auth">
          <div className="form__group">
            <label className="form__label">Email</label>
            <input
              className="form__input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="form__group">
            <label className="form__label">Password</label>
            <input
              className="form__input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              required
            />
          </div>
          <button type="submit" className="button button--primary" disabled={loading}>
            Sign in
          </button>
        </form>
      )}
    </div>
  );
}

export default AuthPage;
