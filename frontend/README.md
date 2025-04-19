# Financial Dashboard Frontend

A modern financial dashboard built with React, Vite, and TailwindCSS.

## Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
frontend/
├── src/
│   ├── components/    # Reusable UI components
│   ├── hooks/         # Custom React hooks
│   ├── utils/         # Utility functions
│   ├── constants/     # Application constants
│   └── config/        # Configuration files
├── public/            # Static assets
└── dist/              # Production build output
```

## Clean Code Guidelines

### Code Organization

- Keep components small and focused on a single responsibility
- Extract complex logic into custom hooks
- Organize files by feature/module rather than type
- Keep related code close together

### Naming Conventions

- Use descriptive names for variables, functions, and components
- Use camelCase for variables and functions
- Use PascalCase for components
- Use ALL_CAPS for constants

### Component Structure

- Keep components small (< 200 lines)
- Extract reusable parts into their own components
- Use composition over inheritance
- Pass props explicitly rather than using context for everything

### Functions

- Keep functions small and focused on a single task
- Prefer pure functions when possible
- Limit arguments to 3 or fewer
- Return early to avoid deep nesting

### State Management

- Keep state as close as possible to where it's used
- Use hooks for local state
- Use context for global state
- Be explicit about where state changes happen

### Performance

- Use useMemo, useCallback, and React.memo appropriately
- Avoid excessive re-renders
- Split large components to minimize rerenders
