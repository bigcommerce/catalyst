# Catalyst

Catalyst monorepo. Readme is a WIP

## Getting Started

1. Install project dependencies:

```bash
corepack enable pnpm
pnpm install
```

2. Setup environment variables:

```bash
 cp .env.example .env
```

Update `.env` with your values

3. (Optional) Vscode setup
```bash
 cp .vscode/settings.example.json .vscode/settings.json
```

4. Run dev environment

```bash
pnpm run dev
```

This will run all packages / apps in watch mode
Core: http://localhost:3000
Makeswift: http://localhost:3001

Testing Vercel, test cache
