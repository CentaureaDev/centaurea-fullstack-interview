# Centaurea Fullstack Interview Project

## Overview

Expression Calculator application built with ASP.NET Core Web API (.NET 10.0) and two frontend implementations — React and Vue 3. Features JWT authentication, an event-driven background processing architecture, and a SQLite database for history.

## Features

- **Expression Calculation** — binary (add, subtract, multiply, divide) and unary (factorial, square, square root, negate) operations, plus regex pattern matching
- **JWT Authentication** — register/login with salted PBKDF2 password hashing; all calculation endpoints are protected
- **History Tracking** — every calculation is persisted in SQLite with the user identity and timestamp; timestamps are editable
- **Regexp Rate Limiting** — per-user daily quota for regexp operations tracked in the database
- **Background Processing** — event-driven pipeline: controller enqueues events, `InMemoryBackgroundExecutor` processes them via `CalculateExpressionHandler`
- **Strategy Pattern** — each operation type has its own `ICalculationStrategy` registered in `CalculationStrategyFactory`
- **Dual Frontend** — identical feature set in both React 19 (Vite) and Vue 3 (Vite); shared API/auth logic in `centaurea-ui-shared`
- **Admin Panel** — admin-only endpoint to list all registered users

## Recommended IDE

| Part | Tool |
|------|------|
| Backend (C#) | [Visual Studio Code](https://code.visualstudio.com/) with the **C# DevKit** extension, or **Visual Studio 2022** |
| Frontend (JS/React/Vue) | VS Code with **ESLint** and **Volar** (Vue) extensions |
| Full-stack in one window | VS Code — open the repo root; the solution file and all JS projects are at the top level |

## Project Structure

```
CentaureaAPI/                  # ASP.NET Core Web API
├── Controllers/               # Auth, Expression, Admin endpoints
├── Models/                    # Expression, ExpressionHistory, User, RegexpUsage
├── Services/                  # ExpressionService, UserService, AdminService
│   └── CalculationStrategy*   # Strategy pattern for each operation type
├── Events/                    # CalculateExpressionEvent and subtypes
├── Handlers/                  # Background event handlers
├── Infrastructure/            # In-memory event queue and background executor
├── Data/                      # EF Core ApplicationDbContext (SQLite)
└── Settings/                  # CultureSettings

centaurea-ui-shared/           # Shared JS package (API client, auth, utils)
centaurea-ui-react/            # React 19 + Vite frontend
centaurea-ui-vue3/             # Vue 3 + Vite frontend
```

## Prerequisites

- .NET 10.0 SDK
- Node.js 18+

## Getting Started

### Backend

```bash
cd CentaureaAPI
dotnet run
```

API base URL: `http://localhost:5034`  
Swagger UI: `http://localhost:5034/swagger`

### React Frontend

```bash
cd centaurea-ui-react
npm install
npm start        # Vite dev server → http://localhost:3000
```

Environment variable (`.env`):
```
REACT_APP_API_URL=http://localhost:5034/api
```

### Vue 3 Frontend

```bash
cd centaurea-ui-vue3
npm install
npm run dev      # Vite dev server → http://localhost:5173
```

Environment variable (`.env`):
```
VITE_API_URL=http://localhost:5034/api
```

## API Reference

All `/api/expression/*` and `/api/admin/*` endpoints require a JWT Bearer token.

### Auth (`/api/auth`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Authenticate and receive a JWT |

**Register / Login body:**
```json
{ "name": "Alice", "email": "alice@example.com", "password": "secret" }
```

**Response:**
```json
{ "token": "<jwt>", "user": { "id": 1, "name": "Alice", "email": "alice@example.com" } }
```

### Expressions (`/api/expression`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/expression/samples` | Get 8 random sample expressions |
| POST | `/api/expression/calculate` | Calculate an expression |
| GET | `/api/expression/history?limit=100` | Get calculation history for the current user |
| DELETE | `/api/expression/history` | Clear all history |
| PUT | `/api/expression/history/{id}/computed-time` | Update the timestamp of a history record |

**Calculate request body:**
```json
{
  "operation": 0,
  "firstOperand": 10,
  "secondOperand": 5
}
```

For `Regexp` operations, use `pattern` and `text` instead of operands:
```json
{ "operation": 4, "pattern": "\\d+", "text": "abc 123" }
```

**Operation enum:**

| Value | Name | Arity |
|-------|------|-------|
| 0 | Addition | Binary |
| 1 | Subtraction | Binary |
| 2 | Multiplication | Binary |
| 3 | Division | Binary |
| 4 | Regexp | Binary (pattern + text) |
| 5 | Factorial | Unary |
| 6 | Square | Unary |
| 7 | SquareRoot | Unary |
| 8 | Negate | Unary |

**Calculate response:**
```json
{
  "result": { "operation": 0, "firstOperand": 10, "secondOperand": 5, "result": 15, "expressionText": "10 + 5 = 15", "computedTime": "..." },
  "regexpUsage": { "used": 2, "remaining": 8, "total": 10 }
}
```
`regexpUsage` is only present for Regexp operations.

### Admin (`/api/admin`) — requires admin role

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/users` | List all registered users |

## Architecture

- **Event-driven calculation**: `ExpressionController` enqueues a `CalculateExpressionEvent` into an in-memory queue and awaits its result (5-second timeout). `CalculateExpressionHandler` processes the event in the background using the Strategy pattern.
- **Strategy pattern**: Each `OperationType` has a dedicated `ICalculationStrategy` implementation registered in `CalculationStrategyFactory`.
- **Authentication**: JWT tokens are issued by `UserService` and validated via ASP.NET Core's JWT middleware. Passwords are stored as salted PBKDF2 hashes.
- **Regexp rate limiting**: Each user is limited to a configurable number of regexp operations per day, tracked in the `RegexpUsage` table.
- **Shared JS library**: `centaurea-ui-shared` provides the typed API client (`ApiClient`, `ApiOperations`) and `AuthManager` used by both frontends. Uses JSDoc for type-checking without TypeScript.

## Architecture

### Backend Architecture
- **Controllers**: Handle HTTP requests and responses
- **Services**: Business logic and data operations
- **Handlers**: Background event processing
- **Infrastructure**: Event queue with in-memory implementation
- **Data**: Entity Framework Core with SQLite

### Key Design Patterns
- **Event-Driven Architecture**: Calculations trigger background events for history storage
- **Repository Pattern**: DbContext for data access
- **Dependency Injection**: All services registered in Startup.cs
- **Background Processing**: Hosted service processes queued events asynchronously

### Frontend Architecture
- **Component-Based**: Modular UI components
- **Service Layer**: Separation of API calls from components
- **Reactive State**: React hooks / Vue3 Composition API

## Database
- **Provider**: SQLite
- **File**: `expressions.db`
- **Tables**: ExpressionHistory (stores all calculations with user info)

## Development

### Available Commands (Backend)
- `dotnet build` - Build the project
- `dotnet run` - Run the project
- `dotnet watch run` - Run with hot reload
- `dotnet test` - Run tests (when added)

### Available Commands (Frontend)
React:
- `npm start` - Start development server
- `npm test` - Run tests
- `npm run build` - Build for production

Vue3:
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
