# JavaScript Type Checking with JSDoc

This project uses **JSDoc comments** to provide TypeScript-like autocomplete and type checking without requiring TypeScript.

## What's Configured

### 1. JSConfig Files
Each package has a `jsconfig.json` that enables:
- ✅ Type checking via JSDoc comments (`checkJs: true`)
- ✅ Strict type checking options
- ✅ IntelliSense and autocomplete
- ✅ Module path resolution
- ✅ Import suggestions

**Files:**
- [`centaurea-ui-react/jsconfig.json`](centaurea-ui-react/jsconfig.json) - React app with path aliases
- [`centaurea-ui-api/jsconfig.json`](centaurea-ui-api/jsconfig.json) - API package
- [`centaurea-ui-auth/jsconfig.json`](centaurea-ui-auth/jsconfig.json) - Auth package

### 2. Inline JSDoc Type Definitions
All packages use JSDoc `@typedef` declarations directly in JavaScript files for complete type safety without separate .d.ts files.

**Key files with type definitions:**
- [`centaurea-ui-api/src/index.js`](centaurea-ui-api/src/index.js) - API operations, models, enums
- [`centaurea-ui-auth/src/authManager.js`](centaurea-ui-auth/src/authManager.js) - Auth types
- [`centaurea-ui-auth/src/observable.js`](centaurea-ui-auth/src/observable.js) - Generic Observable
- [`centaurea-ui-react/src/providers/AuthProvider.jsx`](centaurea-ui-react/src/providers/AuthProvider.jsx) - Auth context types

## Features You Get

### ✨ Full Autocomplete
Type a few characters and get intelligent suggestions:
```javascript
const { operations } = useApi();
operations.expressions.  // Shows: history, samples, calculate, clearHistory, etc.
```

### 🔍 Type Checking
Catch errors before runtime:
```javascript
// ❌ Error: Property 'invalidMethod' does not exist
operations.expressions.invalidMethod();

// ✅ Correct
const { data } = useQuery(operations.expressions.history(50));
```

### 📖 Inline Documentation
Hover over any function/property to see:
- Parameter types and descriptions
- Return types
- Usage examples
- JSDoc comments

### 🚀 Parameter Hints
As you type function arguments:
```javascript
calculate({
  operation: 0,        // Shows: "Operation type (0=Add, 1=Subtract...)"
  firstOperand: 5,     // Shows: "First operand (required for binary ops)"
  secondOperand: 3     // Shows: "Second operand (required for binary ops)"
});
```

### 🎯 Go to Definition
Ctrl+Click (Cmd+Click on Mac) on any import to jump to:
- Source implementation
- Type definition
- JSDoc comments

### 🔄 Auto-Import
Start typing a function/component name and VS Code suggests imports:
```javascript
useCalcu  // Suggests: import { useCalculate } from '../features/expressions/hooks'
```

## Usage Examples

### Working with API Operations

```javascript
import { useQuery, useMutation } from '@tanstack/react-query';
import { useApi } from '../providers';

function MyComponent() {
  const { operations } = useApi();
  
  // ✅ Full autocomplete for query
  const { data: history, isLoading } = useQuery(
    operations.expressions.history(50)  // Autocomplete shows parameter hints
  );
  
  // ✅ Full autocomplete for mutations
  const { mutate: calculate } = useMutation(
    operations.expressions.calculate()
  );
  
  // ✅ Type-checked mutation parameters
  const handleCalculate = () => {
    calculate({
      operation: 0,           // Autocomplete knows this is a number
      firstOperand: 5,        // Type-checked
      secondOperand: 3        // Type-checked
    });
  };
}
```

### Using Auth Manager

```javascript
import { useAuth } from '../providers';

function LoginForm() {
  const { login, user, isAuthenticated } = useAuth();
  
  // ✅ Autocomplete for user properties
  if (isAuthenticated) {
    console.log(user.username);  // Autocomplete: id, username, email, isAdmin
  }
  
  // ✅ Type-checked login parameters
  await login({
    username: 'test',  // Type-checked
    password: '123'    // Type-checked
  });
}
```

### Operation Types Enum

```javascript
import { OperationType } from 'centaurea-ui-api';

// ✅ Full autocomplete for enum values
const op = OperationType.Addition;       // = 0
const op2 = OperationType.Subtraction;   // = 1
const op3 = OperationType.Multiplication;// = 2
// ... etc
```

## Path Aliases (React App Only)

The React app supports path aliases for cleaner imports:

```javascript
// Instead of: import Button from '../../../components/Button'
import Button from '@components/Button';

// Available aliases:
import X from '@/...';           // src/...
import X from '@components/...'; // src/components/...
import X from '@pages/...';      // src/pages/...
import X from '@features/...';   // src/features/...
import X from '@providers/...';  // src/providers/...
import X from '@services/...';   // src/services/...
import X from '@store/...';      // src/store/...
```

## Viewing Type Errors

### In VS Code
1. Open the **Problems** panel (View → Problems or Ctrl+Shift+M)
2. See all type errors across the project
3. Click any error to jump to the file

### In Terminal
```bash
# Check specific file
npx tsc --noEmit path/to/file.js

# Check entire project
cd centaurea-ui-react
npx tsc --noEmit --project jsconfig.json
```

## Writing JSDoc for Type Checking

### Function Parameters and Return Types
```javascript
/**
 * Calculate an expression
 * @param {number} operation - Operation type (0-8)
 * @param {number|null} firstOperand - First operand
 * @param {number|null} secondOperand - Second operand
 * @returns {Promise<CalculateResult>} Calculation result
 */
async function calculate(operation, firstOperand, secondOperand) {
  // implementation
}
```

### Complex Types with @typedef
```javascript
/**
 * @typedef {Object} User
 * @property {number} id - User ID
 * @property {string} username - Username
 * @property {string} email - Email address
 * @property {boolean} isAdmin - Admin flag
 */

/**
 * Get user by ID
 * @param {number} id - User ID
 * @returns {Promise<User>} User object
 */
async function getUser(id) {
  // implementation
}
```

### Generic Types
```javascript
/**
 * @template T
 * @param {T} value - Value to store
 * @returns {() => T} Getter function
 */
function createGetter(value) {
  return () => value;
}
```

## Benefits

### ✅ Pure JavaScript
- No TypeScript compiler needed
- No .d.ts files to maintain separately
- Types defined right next to implementation
- No build step changes

### ✅ Better Developer Experience
- IntelliSense everywhere
- Catch errors as you type
- Self-documenting code
- Faster development

### ✅ Production Ready
- No runtime overhead
- Type checking only during development
- Same build process as before

## Troubleshooting

### Autocomplete Not Working
1. Reload VS Code window (Ctrl+Shift+P → "Reload Window")
2. Check that `jsconfig.json` exists in the project root
3. Verify VS Code is using workspace TypeScript version

### Type Errors Showing
This is a feature! The type checking will now catch potential bugs.

Some errors are expected in old code that hasn't been migrated to use the new hooks:
- `AdminPage.jsx`, `CalculatorPage.jsx`, `SamplesPage.jsx`, `HistoryPage.jsx` - these use old services
- These will be resolved when migrating to the new feature-based hooks

To suppress type errors temporarily:
- Add `// @ts-ignore` above the line
- Or fix the code to match the types
- Or add proper JSDoc type annotation

### Imports Not Resolving
1. Check the import path is correct
2. Verify the module exports the member you're importing
3. For path aliases, ensure `jsconfig.json` baseUrl and paths are configured

## Additional Resources

- [JSDoc Reference](https://jsdoc.app/)
- [TypeScript JSDoc Support](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html)
- [VS Code JavaScript IntelliSense](https://code.visualstudio.com/docs/languages/javascript)
- [TanStack Query TypeScript Guide](https://tanstack.com/query/latest/docs/react/typescript)

## Next Steps

1. ✅ Configuration complete - autocomplete and type checking are active
2. ✅ All type definitions added inline with JSDoc
3. 📝 Some type errors exist in old pages (expected - they use old services)
4. 🔨 To fix: Migrate old pages to use new feature-based hooks
5. 🎯 Use the type system to catch bugs early during development
