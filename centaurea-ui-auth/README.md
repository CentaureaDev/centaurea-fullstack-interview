# centaurea-ui-auth

Shared authentication logic for Centaurea UI applications.

## Features

- **Token Storage Interface**: Configurable storage implementation (localStorage, sessionStorage, memory)
- **AuthManager**: Simple authentication operations (register, login, logout)
- **userStore**: Shared observable instance for user state management

## Installation

```bash
npm install centaurea-ui-auth
```

## Usage

### Basic Setup

```javascript
import { AuthManager, LocalTokenStorage } from 'centaurea-ui-auth';

// Create an auth manager with API URL and localStorage
const apiUrl = 'https://api.example.com';
const authManager = new AuthManager(apiUrl, new LocalTokenStorage());
```

### Using Different Storage

```javascript
import { AuthManager, SessionTokenStorage, MemoryTokenStorage } from 'centaurea-ui-auth';

const apiUrl = 'https://api.example.com';

// Use session storage
const authManager = new AuthManager(apiUrl, new SessionTokenStorage());

// Use memory storage (good for testing or SSR)
const authManager = new AuthManager(apiUrl, new MemoryTokenStorage());
```

### Authentication Operations

```javascript
// Register a new user (automatically stores credentials)
try {
  const user = await authManager.register('John Doe', 'john@example.com', 'password123');
  console.log('Registered:', user);
} catch (error) {
  console.error('Registration failed:', error.message);
}

// Login (automatically stores credentials)
try {
  const user = await authManager.login('john@example.com', 'password123');
  console.log('Logged in:', user);
} catch (error) {
  console.error('Login failed:', error.message);
}

// Get current token
const token = authManager.getToken();

// Get current user
const user = authManager.getUser();

// Logout
authManager.logout();
```

### Using Observable for Generic State

The `Observable` class can be used for any type of state:

```javascript
import { Observable } from 'centaurea-ui-auth';

// Create observable for any data type
const counterStore = new Observable(0);
const settingsStore = new Observable({ theme: 'dark', language: 'en' });
const itemsStore = new Observable([]);

// Subscribe to changes
const unsubscribe = counterStore.subscribe((value) => {
  console.log('Counter changed:', value);
});

// Update value
counterStore.setValue(5);

// Get current value
const current = counterStore.getValue();

// Clear (set to null)
counterStore.clear();

// Unsubscribe
unsubscribe();
```

### Integrating with React/Vue (Using UserStore)

The `UserStore` extends `Observable` with user-specific helpers:

```javascript
import { AuthManager, UserStore, LocalTokenStorage } from 'centaurea-ui-auth';

const apiUrl = 'https://api.example.com';
const authManager = new AuthManager(apiUrl, new LocalTokenStorage());

// Initialize user store with current user
const userStore = new UserStore(authManager.getUser());

// After login, update the store
async function handleLogin(email, password) {
  try {
    const user = await authManager.login(email, password);
    userStore.setValue(user);
  } catch (error) {
    console.error('Login failed:', error);
  }
}

// After logout, clear the store
function handleLogout() {
  authManager.logout();
  userStore.clear();
}

// Subscribe to user changes in your components
const unsubscribe = userStore.subscribe((user) => {
  // Update UI based on user state
  console.log('User state changed:', user);
});

// Check authentication status
if (userStore.getValue() !== null) {
  console.log('User is logged in');
}

// Check admin status
const user = userStore.getValue();
if (user?.isAdmin) {
  console.log('User is admin');
}

// Unsubscribe
unsubscribe();
```

## Custom Token Storage

You can implement your own token storage by adhering to the interface:

```javascript
class CustomTokenStorage {
  getItem(key) {
    // Your implementation
  }

  setItem(key, value) {
    // Your implementation
  }

  removeItem(key) {
    // Your implementation
  }
}

const authManager = new AuthManager(apiUrl, new CustomTokenStorage());
```

## API Reference

### AuthManager

- `constructor(apiUrl, tokenStorage)` - Create new auth manager
  - `apiUrl` - Base URL for API endpoints
  - `tokenStorage` - Token storage implementation
- `getToken()` - Get current token
- `getUser()` - Get current user
- `register(name, email, password)` - Register and store credentials, returns user
- `login(email, password)` - Login and store credentials, returns user
- `logout()` - Clear stored credentials

### userStore

Shared observable instance for user state:

- `subscribe(observer)` - Subscribe to user changes, returns unsubscribe function
- `getValue()` - Get current user
- `setValue(user)` - Set current user and notify observers
- `clear()` - Clear current user and notify observers

### Token Storage Implementations

- `LocalTokenStorage` - Uses localStorage
- `SessionTokenStorage` - Uses sessionStorage
- `MemoryTokenStorage` - Uses in-memory storage
