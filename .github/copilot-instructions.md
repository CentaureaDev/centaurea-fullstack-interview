<!-- Use this file to provide workspace-specific custom instructions to Copilot. -->
- [x] Create copilot-instructions.md file in .github directory
- [x] Clarify Project Requirements - ASP.NET Core Web API targeting .NET 10.0
- [x] Scaffold the ASP.NET Core Project - Created CentaureaAPI project
- [ ] Customize the Project
- [x] Install Required Extensions - C# DevKit installed
- [x] Compile the Project - Build successful
- [x] Create and Run Task - Project runs successfully
- [x] Launch the Project - API listening on http://localhost:5034
- [x] Ensure Documentation is Complete - README.md created
- [x] Ensure code formatedd according principles described in codestyle.guideline

## Code Style

Follow all rules in `codestyle.guideline` and `react.styleguide` (for React components). Key rules relevant to code generation:

- In JS/TS classes (shared, react, vue projects): order members as **public/private fields → constructor → public methods → private methods** (`#` prefix).
- In React functional components: context hooks → state → refs → effects → callbacks → handlers → memos/derived values → return JSX.
- Event handler functions use `handle` prefix (e.g., `handleSubmit`, `handleCancelEdit`).
- Do not `import React from 'react'` — the JSX transform handles it.

