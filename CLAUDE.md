# Carpentry E-Commerce Project Guide

## Technical Stack
- **Framework**: Next.js 16.1 (App Router)
- **Library**: React 19
- **Language**: TypeScript
- **Package Manager**: npm

## Architecture Rules
1. **The Flow**: Frontend -> `/api/b4f` -> `/api/backend` -> `/api/3rdparty`.
2. **Layer Separation**:
    - Never call `/api/3rdparty` directly from the frontend.
    - `/api/backend` should act as an abstraction layer (Interface) for the mocks.
3. **Mocking**: `/api/3rdparty` must mimic realistic delays and simple data structures for CMS, PIM, ERP, etc.

## UI/UX Goals
- **Niche**: Carpentry and Woodworking supplies.
- **Layout**: Header with Search -> Main Content -> Footer.
- **Browsing**: Faceted search is a priority (sidebar filters for wood type, price, etc.).

## Command Shortcuts
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run lint`: Run ESLint