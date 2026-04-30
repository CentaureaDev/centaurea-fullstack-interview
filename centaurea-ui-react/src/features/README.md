# Features Directory

This directory contains the feature-based structure for the React application, organized by domain (expressions, users). Each feature contains a consolidated hooks file that exports all TanStack Query operations for clean separation of concerns.

## Structure

```
features/
├── expressions/
│   ├── hooks.js                     # All expression hooks consolidated
│   └── index.js                     # Main export with OperationType enums
├── users/
│   ├── hooks.js                     # All user hooks consolidated
│   └── index.js                     # Main export
└── index.js                         # Central export for all features
```

## Usage

### Expression Hooks

#### `useCalculate`
Mutation hook for calculating expressions.

```jsx
import { useCalculate, OperationType } from '../features';

function CalculatorComponent() {
  const { mutate: calculate, isLoading, error, data } = useCalculate();

  const handleCalculate = () => {
    // Binary operation
    calculate({ 
      operation: OperationType.Addition, 
      firstOperand: 5, 
      secondOperand: 3 
    });

    // Unary operation
    calculate({ 
      operation: OperationType.Factorial, 
      firstOperand: 5 
    });

    // Regexp operation
    calculate({ 
      operation: OperationType.Regexp, 
      pattern: '\\d+', 
      text: 'abc123' 
    });
  };

  return (
    <button onClick={handleCalculate} disabled={isLoading}>
      Calculate
    </button>
  );
}
```

#### `useExpressionHistory`
Query hook for fetching expression history.

```jsx
import { useExpressionHistory } from '../features';

function HistoryComponent() {
  const { data: history, isLoading, error, refetch } = useExpressionHistory(50);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {history?.map(item => (
        <div key={item.id}>{item.expression}</div>
      ))}
    </div>
  );
}
```

#### `useClearHistory`
Mutation hook for clearing expression history.

```jsx
import { useClearHistory } from '../features';

function ClearHistoryButton() {
  const { mutate: clearHistory, isLoading } = useClearHistory();

  return (
    <button onClick={() => clearHistory()} disabled={isLoading}>
      Clear History
    </button>
  );
}
```

#### `useUpdateComputedTime`
Mutation hook for updating the computed time of a history item.

```jsx
import { useUpdateComputedTime } from '../features';

function UpdateTimeButton({ historyId }) {
  const { mutate: updateComputedTime } = useUpdateComputedTime();

  const handleUpdate = () => {
    updateComputedTime({ 
      id: historyId, 
      computedTime: new Date().toISOString() 
    });
  };

  return <button onClick={handleUpdate}>Update Time</button>;
}
```

#### `useSamples`
Query hook for fetching sample expressions.

```jsx
import { useSamples } from '../features';

function SamplesComponent() {
  const { data: samples, isLoading } = useSamples();

  if (isLoading) return <div>Loading samples...</div>;

  return (
    <div>
      {samples?.map((sample, index) => (
        <div key={index}>{sample.expression}</div>
      ))}
    </div>
  );
}
```

### User Hooks

#### `useUsers`
Query hook for fetching all users (admin only).

```jsx
import { useUsers } from '../features';

function AdminUsersComponent() {
  const { data: users, isLoading, error } = useUsers({
    enabled: isAdmin, // Only fetch if user is admin
  });

  if (isLoading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {users?.map(user => (
        <div key={user.id}>{user.name} - {user.email}</div>
      ))}
    </div>
  );
}
```

## Operation Types

The expression feature re-exports operation types from `centaurea-ui-api`:

```jsx
import { 
  OperationType,
  OperationSymbols,
  OperationNames,
  UnaryOperations,
  BinaryOperations,
  RegexpOperation 
} from '../features';

// OperationType enum values:
// - Addition: 0
// - Subtraction: 1
// - Multiplication: 2
// - Division: 3
// - Regexp: 4
// - Factorial: 5
// - Square: 6
// - SquareRoot: 7
// - Negate: 8
```

## Integration

All hooks require both `AuthProvider` and `ApiProvider` to be wrapped around your app.

### Option 1: Using ConfiguredApiProvider (Recommended)

```jsx
import { AuthProvider, ConfiguredApiProvider } from './providers';
import App from './App';

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5034/api';

root.render(
  <AuthProvider apiUrl={apiUrl}>
    <ConfiguredApiProvider apiUrl={apiUrl}>
      <App />
    </ConfiguredApiProvider>
  </AuthProvider>
);
```

### Option 2: Using ApiProvider with Custom Callbacks

```jsx
import { AuthProvider, ApiProvider, useAuth } from './providers';
import { authManager } from 'centaurea-ui-auth';
import App from './App';

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5034/api';

function AppProviders({ children }) {
  const { logout } = useAuth();

  return (
    <ApiProvider
      apiUrl={apiUrl}
      getToken={() => authManager.getToken()}
      onUnauthorized={logout}
      onForbidden={() => console.warn('Forbidden')}
    >
      {children}
    </ApiProvider>
  );
}

root.render(
  <AuthProvider apiUrl={apiUrl}>
    <AppProviders>
      <App />
    </AppProviders>
  </AuthProvider>
);
```

### Provider Responsibilities

**AuthProvider:**
- Manages user authentication state
- Handles login, register, and logout operations
- Persists tokens in localStorage
- Provides user information

**ApiProvider:**
- Creates and manages TanStack Query client
- Configures API client with callbacks (getToken, onUnauthorized, onForbidden)
- Provides `useApi()` hook for accessing operations
- Independent of authentication implementation
- Accepts callbacks as props for flexibility

**ConfiguredApiProvider:**
- Convenience wrapper around ApiProvider
- Automatically connects to AuthProvider
- Wires up callbacks (authManager.getToken, logout on 401, etc.)
- Recommended for most use cases

This separation of concerns allows:
- Authentication logic independent of API operations
- Easier testing (can mock callbacks)
- Clear responsibility boundaries
- Flexibility to use different auth implementations

## Benefits

1. **Separation of Concerns**: Business logic is separated from UI components
2. **Type Safety**: JSDoc comments provide IntelliSense in VS Code
3. **Reusability**: Hooks can be used across multiple components
4. **Consistency**: All API calls follow the same pattern
5. **Cache Management**: TanStack Query handles caching and invalidation automatically
6. **Error Handling**: Centralized error handling in AuthProvider
7. **Feature Organization**: Code is organized by feature domain, making it easier to navigate
