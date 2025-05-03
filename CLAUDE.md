# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
- Build: `pnpm build` (all) or `pnpm --filter=<app> build`
- Dev: `pnpm dev` (all) or `pnpm --filter=<app> dev`
- Lint: `pnpm lint` or `pnpm --filter=<app> lint`
- Format: `pnpm format` or `pnpm --filter=<app> format`
- Deploy: `pnpm deploy` or `pnpm --filter=<app> deploy`
- Preview: `pnpm --filter=<app> preview` (for web and workers)

## Code Style Guidelines
- Use Biome for linting and formatting (not ESLint)
- Indentation: tabs (not spaces)
- Quotes: double quotes
- React components: PascalCase (`RootLayout`, `Home`)
- Variables/functions: camelCase
- Imports: organize imports (`import React from 'react'` before other imports)
- Type annotations: use TypeScript interfaces and types
- Error handling: use try/catch blocks for error handling
- File structure: follow existing patterns in the monorepo

## Project Structure
- Monorepo managed with Turborepo and pnpm
- Apps:
  - `web`: Next.js app with Turbopack and Cloudflare deployment
  - `workers`: Cloudflare Workers using Hono framework and Vite