# CloudCure Frontend

Enterprise-grade React frontend application with strict TypeScript, comprehensive tooling, and modern best practices.

## Features

✅ **Tech Stack**
- React 19 + TypeScript (strict mode)
- Vite for blazing-fast development
- Tailwind CSS + shadcn/ui components
- Redux Toolkit + RTK Query
- React Router v7

✅ **Code Quality**
- Strict TypeScript (no `any`, explicit return types)
- ESLint (no console, no suppressions)
- Prettier for formatting
- Husky pre-commit hooks
- Custom logger replacing all console usage

✅ **Architecture**
- Route abstraction with metadata (auth, permissions, layouts)
- Protected routes with role-based access
- RTK Query with automatic token management
- Modular folder structure

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm

### Installation

```bash
# Install dependencies
pnpm install

# Setup Husky hooks
pnpm prepare

# Start development server
pnpm dev
```

### Environment Variables

Create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

## Available Scripts

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm lint         # Run ESLint
pnpm lint:fix     # Fix linting issues
pnpm type-check   # TypeScript type checking
pnpm preview      # Preview production build
```

## Project Structure

```
src/
├── components/ui/      # shadcn/ui components
├── constants/          # App constants
├── hooks/              # Custom hooks
├── layouts/            # Layout components
├── lib/                # Utilities
├── pages/              # Page components
├── routes/             # Route configuration
├── services/           # API slices (RTK Query)
├── store/              # Redux store
├── types/              # TypeScript types
└── utils/              # Logger and utilities
```

## Route Configuration

Routes are defined in `src/routes/config.tsx`:

```typescript
const routes: RouteConfig[] = [
  {
    path: '/dashboard',
    element: <DashboardPage />,
    auth: true,           // Requires authentication
    permission: 'admin',  // Optional: role requirement
    layout: 'main',       // Layout to use
  },
  // ...
];
```

## Backend Integration

Configured to work with NestJS backend:
- **Base URL**: `http://localhost:3000/api/v1`
- **Authentication**: JWT (access token + HTTP-only refresh cookie)
- **Auto token refresh** on 401 responses

## Code Standards

> **Zero Tolerance**
> - ❌ No `console.*` usage (use `logger` instead)
> - ❌ No `any` types
> - ✅ Explicit function return types
> - ✅ Strict null checks

## License

UNLICENSED
