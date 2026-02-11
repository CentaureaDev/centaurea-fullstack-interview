# centaurea-ui-api

Shared API client for Centaurea UI applications with TanStack Query support.

## Features

- **Feature-based Organization**: Expressions and Users modules with clear separation
- **API Client**: Core client with automatic token injection and unauthorized handling
- **TanStack Query Integration**: Pre-configured queries and mutations with automatic cache invalidation
- **Type-safe Operations**: Operation type enumerations and metadata
- **Framework Agnostic**: Works with both React and Vue via TanStack Query

## Installation

```bash
npm install centaurea-ui-api
npm install @tanstack/react-query  # or @tanstack/vue-query
```

## Project Structure

```
src/
├── expressions/
│   ├── api.js        # Expression API functions
│   ├── queries.js    # Query configurations
│   ├── mutations.js  # Mutation configurations with auto invalidation
│   └── keys.js       # Query cache keys
├── users/
│   ├── api.js        # User API functions
│   ├── queries.js    # Query configurations
│   └── keys.js       # Query cache keys
├── apiClient.js      # Core API client with auth
├── operationTypes.js # Operation enums and metadata
└── index.js          # Main exports
```

## Quick Start

### Setup (React)

```javascript
import { createApi, createOperations } from 'centaurea-ui-api';
import { authManager } from 'centaurea-ui-auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

// Create API with auth integration
const api = createApi(
  'http://localhost:5034/api',
  () => authManager.getToken(),
  () => {
    // Handle 401 Unauthorized
    authManager.logout();
    window.location.href = '/login';
  },
  () => {
    // Handle 403 Forbidden (lack of permission)
    alert('You do not have permission to perform this action');
  }
);

// Create operations grouped by feature
const operations = createOperations(api, queryClient);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp operations={operations} />
    </QueryClientProvider>
  );
}
```

### Setup (Vue)

```javascript
import { createApi, createOperations } from 'centaurea-ui-api';
import { authManager } from 'centaurea-ui-auth';
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query';

const queryClient = new QueryClient();

const api = createApi(
  'http://localhost:5034/api',
  () => authManager.getToken(),
  () => {
    // Handle 401 Unauthorized
    authManager.logout();
    window.location.href = '/login';
  },
  () => {
    // Handle 403 Forbidden
    alert('You do not have permission to perform this action');
  }
);

const operations = createOperations(api, queryClient);
const operations = createOperations(api, queryClient);

app.use(VueQueryPlugin, { queryClient });
```

## Usage Examples

### Using Operations (React)

All operations for a feature are grouped together, making it easy to work with related queries and mutations:

```javascript
import { useQuery, useMutation } from '@tanstack/react-query';
import { OperationType } from 'centaurea-ui-api';

function SamplesPage({ operations }) {
  // All expression operations in one namespace
  const { data: samples, isLoading } = useQuery(operations.expressions.samples());
  const { data: history } = useQuery(operations.expressions.history(50));
  const calculateMutation = useMutation(operations.expressions.calculate());
  const clearMutation = useMutation(operations.expressions.clearHistory());
  
  const handleCalculate = () => {
    calculateMutation.mutate({
      operation: OperationType.Addition,
      firstOperand: 5,
      secondOperand: 3,
    });
  };
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      <ul>
        {samples.map(sample => (
          <li key={sample.id}>{sample.expression}</li>
        ))}
      </ul>
      
      <button onClick={handleCalculate}>Calculate 5 + 3</button>
      <button onClick={() => clearMutation.mutate()}>Clear History</button>
      
      {calculateMutation.data && (
        <div>Result: {calculateMutation.data.result}</div>
      )}
      
      <div>
        {history?.map(item => (
          <div key={item.id}>{item.expression} = {item.result}</div>
        ))}
      </div>
    </div>
  );
}
```

### Advanced: Manual Cache Management

Keys are included in operations for advanced use cases:

```javascript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function AdvancedExample({ operations }) {
  const queryClient = useQueryClient();
  const { data: history } = useQuery(operations.expressions.history(50));
  
  // Custom mutation with manual cache update
  const updateComputedTime = useMutation({
    ...operations.expressions.updateComputedTime(),
    onSuccess: (data, variables) => {
      // Use keys from the same feature namespace
      queryClient.setQueryData(
        operations.expressions.keys.history(50),
        (oldData) => oldData?.map(item => 
          item.id === variables.id 
            ? { ...item, computedTime: variables.computedTime }
            : item
        )
      );
    },
  });
  
  // Everything for expressions feature is in operations.expressions.*
  return (
    <div>
      {history?.map(item => (
        <div key={item.id}>
          {item.expression}
          <button onClick={() => updateComputedTime.mutate({ 
            id: item.id, 
            computedTime: 100 
          })}>
            Update Time
          </button>
        </div>
      ))}
    </div>
  );
}
```

### Using Operations (Vue)

```vue
<script setup>
import { useQuery, useMutation } from '@tanstack/vue-query';
import { OperationType } from 'centaurea-ui-api';

const props = defineProps(['operations']);

// All expression operations grouped together
const { data: samples, isLoading } = useQuery(props.operations.expressions.samples());
const { data: history } = useQuery(props.operations.expressions.history(50));
const calculateMutation = useMutation(props.operations.expressions.calculate());

const handleCalculate = () => {
  calculateMutation.mutate({
    operation: OperationType.Addition,
    firstOperand: 5,
    secondOperand: 3,
  });
};
</script>

<template>
  <div>
    <div v-if="isLoading">Loading...</div>
    <ul v-else>
      <li v-for="sample in samples" :key="sample.id">
        {{ sample.expression }}
      </li>
    </ul>
    
    <button @click="handleCalculate">Calculate</button>
    <div v-if="calculateMutation.data">
      Result: {{ calculateMutation.data.result }}
    </div>
  </div>
</template>
```

## API Reference

### Main Exports

#### `createApi(apiUrl, getToken, onUnauthorized, onForbidden)`

Creates an API instance with all feature modules.

**Parameters:**
- `apiUrl` - Base API URL
- `getToken` - Function to retrieve auth token
- `onUnauthorized` - Callback when request returns 401 (Unauthorized)
- `onForbidden` - Optional callback when request returns 403 (Forbidden)

```javascript
const api = createApi(
  'http://localhost:5034/api',
  () => getToken(),
  () => handleUnauthorized(),
  () => handleForbidden()
);

// Access feature APIs
api.expressions.getSamples();
api.expressions.calculate(operation, firstOperand, secondOperand, pattern, text);
api.expressions.getHistory(50);
api.expressions.clearHistory();
api.expressions.updateHistoryComputedTime(id, time);
api.users.getUsers();
```

#### `createOperations(api, queryClient)`

Creates TanStack Query configurations grouped by feature (recommended).

All operations for a feature are grouped together, making it easier to work with related queries and mutations.

```javascript
const operations = createOperations(api, queryClient);

// All expression operations in one namespace
useQuery(operations.expressions.samples());
useQuery(operations.expressions.history(50));
useMutation(operations.expressions.calculate());
useMutation(operations.expressions.clearHistory());
useMutation(operations.expressions.updateComputedTime());

// All user operations in one namespace
useQuery(operations.users.list());

// Usage example:
const calculateMutation = useMutation(operations.expressions.calculate());
calculateMutation.mutate({
  operation: OperationType.Addition,
  firstOperand: 5,
  secondOperand: 3,
});
```

**Benefits of grouping by feature:**
- All related operations (queries, mutations, and keys) are in one place
- Easier to discover what operations are available for a feature
- Better code organization when working on feature-specific components
- More intuitive namespace: `operations.expressions.*` instead of `queries.expressions.*` + `mutations.expressions.*` + `queryKeys.expressions.*`
- Keys are co-located: `operations.expressions.keys.history()` right next to `operations.expressions.history()`

#### `createQueries(api)` / `createMutations(api, queryClient)` (Legacy)

For backward compatibility, you can still use separate functions:

```javascript
const queries = createQueries(api);
const mutations = createMutations(api, queryClient);

// Expression queries
useQuery(queries.expressions.samples());
useQuery(queries.expressions.history(limit));

// Expression mutations
useMutation(mutations.expressions.calculate());
useMutation(mutations.expressions.clearHistory());
```

**Note:** Consider migrating to `createOperations()` for better feature-based organization.
```

### Query Keys

Query keys are included in the operations structure for complete feature-based organization:

```javascript
const operations = createOperations(api, queryClient);

// Keys are available within each feature namespace
operations.expressions.keys.all;           // ['expressions']
operations.expressions.keys.samples();     // ['expressions', 'samples']
operations.expressions.keys.history(100);  // ['expressions', 'history', { limit: 100 }]

operations.users.keys.all;        // ['users']
operations.users.keys.list();     // ['users', 'list']

// Example: Manual cache invalidation
queryClient.invalidateQueries({ 
  queryKey: operations.expressions.keys.history() 
});

// Everything for a feature is in one place:
const { data } = useQuery(operations.expressions.history(50));
// ... later
queryClient.invalidateQueries({ 
  queryKey: operations.expressions.keys.history() 
});
```

**Legacy:** The standalone `queryKeys` export is still available but deprecated:
```javascript
import { queryKeys } from 'centaurea-ui-api';
queryKeys.expressions.samples(); // Works but prefer operations.expressions.keys.samples()
```

### Expression API

```javascript
// Get sample expressions
await api.expressions.getSamples();

// Calculate binary operation (addition, subtraction, multiplication, division)
await api.expressions.calculate(
  OperationType.Addition,
  5,
  3
);

// Calculate unary operation (factorial, square, square root, negate)
await api.expressions.calculate(
  OperationType.Factorial,
  5  // secondOperand not needed for unary operations
);

// Regexp operation
await api.expressions.calculate(
  OperationType.Regexp,
  null,  // firstOperand not used for regexp
  null,  // secondOperand not used for regexp
  '[0-9]+',  // pattern
  'test123'  // text
);

// Get history
await api.expressions.getHistory(50);

// Clear history
await api.expressions.clearHistory();

// Update computed time
await api.expressions.updateHistoryComputedTime(1, 123.45);
```

### User API

```javascript
// Get all users (admin only)
await api.users.getUsers();
```

### Operation Types

```javascript
import {
  OperationType,
  OperationSymbols,
  OperationNames,
  UnaryOperations,
  BinaryOperations,
  RegexpOperation,
} from 'centaurea-ui-api';

// Available operations
OperationType.Addition        // 0
OperationType.Subtraction     // 1
OperationType.Multiplication  // 2
OperationType.Division        // 3
OperationType.Regexp          // 4
OperationType.Factorial       // 5
OperationType.Square          // 6
OperationType.SquareRoot      // 7
OperationType.Negate          // 8

// Get operation details
OperationSymbols[OperationType.Addition];  // "+"
OperationNames[OperationType.Addition];    // "Addition"

// Check operation category
UnaryOperations.includes(operation);   // [5, 6, 7, 8]
BinaryOperations.includes(operation);  // [0, 1, 2, 3]
RegexpOperation === operation;         // 4
```

## Cache Invalidation

Mutations automatically invalidate relevant queries:

- `calculate()` → invalidates `history()`
- `clearHistory()` → invalidates `history()`
- `updateComputedTime()` → invalidates `history()`

This ensures UI stays in sync with server state automatically.

## Error Handling

The API client automatically handles 401 (Unauthorized) and 403 (Forbidden) errors via callbacks:

```javascript
const api = createApi(
  apiUrl,
  () => authManager.getToken(),
  () => {
    // Called on any 401 response (Unauthorized - invalid/missing token)
    authManager.logout();
    window.location.href = '/login';
  },
  () => {
    // Called on any 403 response (Forbidden - lack of permission)
    alert('You do not have permission to perform this action');
  }
);
```

For other errors, use TanStack Query's error handling:

```javascript
const mutation = useMutation({
  ...mutations.expressions.calculate(),
  onError: (error) => {
    console.error('Calculation failed:', error.message);
  }
});
```
