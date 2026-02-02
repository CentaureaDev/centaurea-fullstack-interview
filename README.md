# Centaurea Fullstack Interview Project

## Overview
This is a clean ASP.NET Core Web API project targeting .NET 10.0.

## Project Structure
```
CentaureaAPI/
├── Controllers/         # API endpoints
├── Properties/          # Project configuration
├── appsettings.json     # Application settings
├── Program.cs           # Application entry point
└── CentaureaAPI.csproj  # Project file
```

## Getting Started

### Prerequisites
- .NET 10.0 SDK or later
- Visual Studio Code (optional)

### Build
```bash
cd CentaureaAPI
dotnet build
```

### Run
```bash
cd CentaureaAPI
dotnet run
```

The API will be available at `http://localhost:5034` by default.

### Test
```bash
curl http://localhost:5034/weatherforecast
```

## Development

### Available Commands
- `dotnet build` - Build the project
- `dotnet run` - Run the project
- `dotnet test` - Run tests (when added)
- `dotnet watch run` - Run with file watching for development

## Architecture

This project includes:
- Minimal APIs configuration
- Swagger/OpenAPI documentation
- Weather Forecast sample endpoint

## Next Steps

1. Add your API controllers and services
2. Configure database if needed
3. Add authentication/authorization
4. Implement business logic
5. Add unit tests
