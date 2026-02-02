# Centaurea Fullstack Interview Project

## Overview
This is an Expression Calculator application built with ASP.NET Core Web API (targeting .NET 10.0) and modern frontend frameworks (React and Vue3).

## Features
- **Expression Calculation**: Calculate mathematical expressions (addition, subtraction, multiplication, division)
- **History Tracking**: All calculations are stored in a database with user information
- **Background Processing**: Uses an event-driven architecture with background handlers
- **Multiple UIs**: Both React and Vue3 implementations included
- **RESTful API**: Clean API design with Swagger documentation

## Project Structure
```
CentaureaAPI/                     # Backend API
├── Controllers/                  # API endpoints (ExpressionController)
├── Models/                       # Domain models (Expression, ExpressionHistory)
├── Services/                     # Business logic (ExpressionService)
├── Data/                         # Database context
├── Handlers/                     # Background event handlers
├── Infrastructure/               # Event queue and background executor
└── Settings/                     # Configuration settings

centaurea-ui-react/              # React frontend
├── src/
│   ├── components/              # React components
│   └── services/                # API service layer

centaurea-ui-vue3/               # Vue3 frontend
├── src/
│   ├── components/              # Vue components
│   └── services/                # API service layer
```

## Getting Started

### Prerequisites
- .NET 10.0 SDK or later
- Node.js 18+ (for frontend)
- Visual Studio Code (optional)

### Backend (API)

#### Build
```bash
cd CentaureaAPI
dotnet build
```

#### Run
```bash
cd CentaureaAPI
dotnet run
```

The API will be available at `http://localhost:5034` by default.
Swagger UI: `http://localhost:5034/swagger`

#### Test API
```bash
# Get sample expressions
curl http://localhost:5034/api/expression/samples

# Calculate an expression
curl -X POST http://localhost:5034/api/expression/calculate \
  -H "Content-Type: application/json" \
  -d '{"operation": 0, "firstOperand": 10, "secondOperand": 5}'

# Get history
curl http://localhost:5034/api/expression/history
```

### Frontend

#### React UI
```bash
cd centaurea-ui-react
npm install
npm start
```
Visit `http://localhost:3000`

#### Vue3 UI
```bash
cd centaurea-ui-vue3
npm install
npm run dev
```
Visit `http://localhost:5173`

## API Endpoints

### Expression Controller
- `GET /api/expression/samples` - Get sample expressions
- `POST /api/expression/calculate` - Calculate an expression
  - Body: `{ "operation": 0-3, "firstOperand": number, "secondOperand": number }`
  - Operations: 0=Addition, 1=Subtraction, 2=Multiplication, 3=Division
- `GET /api/expression/history?limit=100` - Get calculation history
- `DELETE /api/expression/history` - Clear all history

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

## Next Steps

1. Add authentication and authorization
2. Implement more complex expression parsing
3. Add expression validation
4. Add unit and integration tests
5. Deploy to production environment
6. Add rate limiting
7. Implement caching for frequently calculated expressions
