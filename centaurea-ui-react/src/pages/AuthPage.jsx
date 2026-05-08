import { toUiError } from 'centaurea-ui-shared';
import { useCallback, useState } from 'react';
import Button from '../components/Button';
import Form from '../components/Form';
import FormGroup from '../components/FormGroup';
import FormInput from '../components/FormInput';
import FormLabel from '../components/FormLabel';
import Section from '../components/Section';
import StatusMessage from '../components/StatusMessage';
import { useNotification } from '../providers';
import { useAuth } from '../providers/AuthProvider';

function AuthPage() {
  const auth = useAuth();
  const { notifyError } = useNotification();
  const [authMode, setAuthMode] = useState('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const runAsyncOperation = useCallback(async (action, fallbackMessage = 'Operation failed.') => {
    try {
      return await action();
    } catch (err) {
      notifyError(toUiError(err, fallbackMessage).message);
      return null;
    }
  }, [notifyError]);

  const handleRegister = async (e) => {
    e.preventDefault();
    const data = await runAsyncOperation(() => auth.register(name, email, password), 'Registration failed');

    if (data) {
      setName('');
      setEmail('');
      setPassword('');
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    const data = await runAsyncOperation(() => auth.login(email, password), 'Sign in failed');

    if (data) {
      setEmail('');
      setPassword('');
    }
  };

  const handleShowSignIn = () => {
    setAuthMode('signin');
  };

  const handleShowRegister = () => {
    setAuthMode('register');
  };

  const handleNameChange = (e) => setName(e.target.value);

  const handleEmailChange = (e) => setEmail(e.target.value);

  const handlePasswordChange = (e) => setPassword(e.target.value);

  return (
    <Section>
      <div className="toggle">
        <button
          className={`toggle__button${authMode === 'signin' ? ' toggle__button--active' : ''}`}
          onClick={handleShowSignIn}
        >
          Sign in
        </button>
        <button
          className={`toggle__button${authMode === 'register' ? ' toggle__button--active' : ''}`}
          onClick={handleShowRegister}
        >
          Register
        </button>
      </div>

      {auth.isLoading && <StatusMessage variant="loading">Loading...</StatusMessage>}

      {authMode === 'register' ? (
        <Form variant="auth" onSubmit={handleRegister}>
          <FormGroup>
            <FormLabel>Name</FormLabel>
            <FormInput
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="Your name"
              required
            />
          </FormGroup>
          <FormGroup>
            <FormLabel>Email</FormLabel>
            <FormInput
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="you@example.com"
              required
            />
          </FormGroup>
          <FormGroup>
            <FormLabel>Password</FormLabel>
            <FormInput
              type="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="Create a password"
              required
            />
          </FormGroup>
          <Button type="submit" disabled={auth.isLoading}>
            Register
          </Button>
        </Form>
      ) : (
        <Form variant="auth" onSubmit={handleSignIn}>
          <FormGroup>
            <FormLabel>Email</FormLabel>
            <FormInput
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="you@example.com"
              required
            />
          </FormGroup>
          <FormGroup>
            <FormLabel>Password</FormLabel>
            <FormInput
              type="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="Your password"
              required
            />
          </FormGroup>
          <Button type="submit" disabled={auth.isLoading}>
            Sign in
          </Button>
        </Form>
      )}
    </Section>
  );
}

export default AuthPage;
