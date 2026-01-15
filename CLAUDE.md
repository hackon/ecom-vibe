# Carpentry E-Commerce Project Guide

**Site Name**: Buildy McBuild

## Technical Stack
- **Framework**: Next.js 16.1 (App Router)
- **Library**: React 19
- **Language**: TypeScript
- **Package Manager**: npm
- **Icons**: lucide-react
- **Styling**: CSS Modules

## Architecture

### API Layer Flow
```
Frontend → /api/backend/v1/* → /api/3rdparty/*
```

### Layer Responsibilities
1. **`/api/3rdparty/`** - Mock 3rd party systems with realistic delays (40-200ms)
   - `pim/` - Product Information Management (products, categories, search)
   - `cms/` - Content Management System (pages, assets)
   - `auth/` - Authentication (login, sessions, JWT tokens)
   - `crm/` - Customer Relationship Management (customers, contacts, activities)
   - `erp/` - Enterprise Resource Planning (inventory, orders, pricing, facilities)

2. **`/api/backend/v1/`** - Backend abstraction layer (delegates to 3rdparty)
   - `search/` - Product search with facets
   - `product/[productId]/` - Product details
   - `catalog/` - Categories, products, pricing, availability
   - `customers/` - Customer management with contacts and assortments
   - `orders/` - Order management (create, status, cancel)
   - `carts/` - Cart operations (pricing, validation, submit)
   - `auth/` - Login, logout, token refresh
   - `me/` - Current user info, organizations, permissions
   - `content/` - CMS pages, navigation, banners

3. **Frontend** - Next.js App Router pages and components
   - Never calls `/api/3rdparty` directly
   - All data fetching goes through `/api/backend/v1/`

### Mock Data (`/src/lib/`)
- `pim/mockPim.ts` - 20 products across 3 categories (Wood, Tools, Hardware)
- `cms/mockCms.ts` - Landing page content, hero sections
- `auth/mockAuth.ts` - User sessions (admin/password)
- `crm/mockCrm.ts` - Sample customers and organizations
- `erp/mockErp.ts` - Inventory, orders, facilities, pricing rules

## Current Implementation

### Working Features
- **Home Page** - Hero section, category cards, CTA
- **Search** - Faceted search with filters (category, wood type, price range), pagination
- **Product Detail** - Image gallery, specs, stock status, quantity selector
- **Quick Search** - Header search bar with drawer overlay showing instant results

### Frontend Pages
- `/` - Home page with hero and category cards
- `/search` - Search results with sidebar filters
- `/product/[productId]` - Product detail page

### Components (`/src/components/`)
- `Header.tsx` - Logo, search bar, cart icon
- `SearchContainer.tsx` - Search state management with debounce
- `SearchBar.tsx` - Search input field
- `SearchDrawer.tsx` - Quick search results overlay
- `ProductCard.tsx` - Product card for listings
- `Footer.tsx` - Site footer with links

### Not Yet Implemented
- Shopping cart functionality (UI exists, no backend integration)
- Checkout flow
- User authentication UI
- Customer account pages
- Order history

## UI/UX Goals
- **Niche**: Carpentry and Woodworking supplies
- **Layout**: Header with Search → Main Content → Footer
- **Browsing**: Faceted search with sidebar filters (wood type, price, category)

## Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint