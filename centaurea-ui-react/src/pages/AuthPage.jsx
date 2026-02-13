import { useState } from 'react';
import { useAuth } from '../providers/AuthProvider';

/**
 * Authentication page component
 * Displays sign in and register forms
 * @returns {React.ReactElement}
 */
function AuthPage() {
  const auth = useAuth();
  const [authMode, setAuthMode] = useState('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(/** @type {string|null} */(null));

  /**
   * Handle user registration
   * @param {React.FormEvent<HTMLFormElement>} e
   * @returns {Promise<void>}
   */
  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await auth.register(name, email, password);
      setName('');
      setEmail('');
      setPassword('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
    }
  };

  /**
   * Handle user sign in
   * @param {React.FormEvent<HTMLFormElement>} e
   * @returns {Promise<void>}
   */
  const handleSignIn = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await auth.login(email, password);
      setEmail('');
      setPassword('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign in failed';
      setError(errorMessage);
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

      {error && <div className="message message--error">{error}</div>}
      {auth.isLoading && <div className="message message--loading">Loading...</div>}

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
          <button type="submit" className="button button--primary" disabled={auth.isLoading}>
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
          <button type="submit" className="button button--primary" disabled={auth.isLoading}>
            Sign in
          </button>
        </form>
      )}
    </div>
  );
}

export default AuthPage;
