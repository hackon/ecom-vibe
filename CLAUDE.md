# Carpentry E-Commerce Project Guide

**Site Name**: Buildy McBuild

## Technical Stack
- **Framework**: Next.js 16.1 (App Router)
- **Library**: React 19
- **Language**: TypeScript
- **Package Manager**: npm
- **Icons**: lucide-react
- **Styling**: CSS Modules
- **Search**: Apache Solr 9.4 (Docker)

### Commit logic
For each prompt create a summary in a temporary file called .commit.
When asked to make commit, use this file to create the header and the contents of the commit message.
And always push the commit.

## Architecture

### API Layer Flow
```
Frontend → /api/backend/v1/* → /api/3rdparty/*
```

### Layer Responsibilities
1. **`/api/3rdparty/`** - Mock 3rd party systems with realistic delays (40-200ms)
   - `pim/` - Product Information Management (products, categories)
   - `search/` - Search service (queries Solr, returns faceted results)
   - `cms/` - Content Management System (pages, assets)
   - `auth/` - Authentication (login, sessions, JWT tokens)
   - `crm/` - Customer Relationship Management (customers, contacts, activities)
   - `erp/` - Enterprise Resource Planning (inventory, orders, pricing, facilities)

2. **`/api/backend/v1/`** - Backend abstraction layer (delegates to 3rdparty)
   - `search/` - Product search with facets, also supports `ids` and `skus` params for batch fetching
   - `products/[productId]/` - Single product details
   - `customers/` - Customer management with contacts and assortments
   - `auth/` - Login, logout, token refresh, registration
   - `pages/` - CMS pages (home layout)
   - `article/[slug]/` - CMS articles

3. **Frontend** - Next.js App Router pages and components
   - Never calls `/api/3rdparty` directly
   - All data fetching goes through `/api/backend/v1/`

### Data Layer (`/src/lib/`)
- `pim/odooPim.ts` - Product Information Management via Odoo
- `pim/productGenerator.ts` - Product type definitions and generation utilities
- `odoo/client.ts` - Odoo XML-RPC client
- `cms/mockCms.ts` - Landing page content, hero sections
- `auth/mockAuth.ts` - User sessions
- `crm/mockCrm.ts` - Sample customers and organizations
- `erp/mockErp.ts` - Inventory, orders, facilities, pricing rules

### 3rd Party Configurations (`/3rdParty/`)
- `solr/configsets/products/conf/schema.xml` - Product schema with facet fields
- `solr/configsets/products/conf/solrconfig.xml` - Search handlers and analyzers
- `odoo/addons/` - Custom Odoo addons
- `odoo/config/` - Odoo configuration files
- `odoo/sessions/` - Odoo session data

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
- `/article/[slug]` - CMS article page
- `/profile` - User profile page
- `/admin` - Admin panel (requires employee login)
  - `?view=customers` - Customer management
  - `?view=products` - Product management

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
- `npm run sync` - Sync products (products.json → Odoo → Solr)
- `npm run odoo:test` - Test Odoo connection

## Docker Setup

### Starting Services
```bash
docker-compose up -d
```

This starts:
- Solr (search engine) on port 8983
- Odoo (PIM) on port 8069
- PostgreSQL (Odoo database) on port 5432

### Syncing Products
After Docker services are running, sync the product data:
```bash
npm run sync
```

This unified sync script:
1. Syncs products from `products.json` to Odoo
2. Pulls products from Odoo (with Odoo-assigned IDs)
3. Indexes products to Solr for search

### Admin UIs
- Solr: http://localhost:8983/solr/#/products/query
- Odoo: http://localhost:8069

### Environment Variables
See `.env.template` for required variables:
- `SOLR_URL` - Solr base URL (default: `http://localhost:8983/solr/products`)
- `ODOO_URL` - Odoo base URL (default: `http://localhost:8069`)
- `ODOO_DB` - Odoo database name
- `ODOO_USERNAME` - Odoo username
- `ODOO_API_KEY` - Odoo API key

## User Types & Authentication

The system supports 5 distinct user types with different capabilities and authentication methods.

### Authentication Methods
- **External users** (Private, Professional): Email/password registration or guest checkout
- **Internal users** (Admin, Sales, Employee): Company Active Directory (AD/SSO)

### User Type Hierarchy

#### 1. Admin
- **Authentication**: AD login (company SSO)
- **Capabilities**: Full system access
- **Responsibilities**: System configuration, user management, all administrative functions
- **Note**: With great power comes great responsibility - admin actions should be logged and auditable

#### 2. Private Member
- **Authentication**: Email/password OR guest checkout
- **Profile**: Person profile with name, address, phone, etc.
- **Capabilities**:
  - Browse products and place orders
  - Can checkout as guest (no account) or create an account
  - Standard retail pricing
- **Registration**: Optional - can place orders without registering (guest checkout)

#### 3. Professional (Contractor/Carpenter)
- **Authentication**: Email/password (business registration)
- **Profile**: Company profile with business details, tax ID, etc.
- **Capabilities**:
  - Tax-exempt purchases (B2B)
  - Special pricing deals based on:
    - Contract agreements
    - Project-based pricing
    - Volume discounts
  - Access to professional-only products (if applicable)
- **Note**: May have multiple users under one company account

#### 4. Sales Person
- **Authentication**: AD login (company SSO)
- **Capabilities**:
  - **Impersonation**: Can place orders on behalf of Private or Professional customers
  - View and manage customer accounts
  - Access to sales tools and reporting
- **Order Attribution**: Orders placed via impersonation are flagged:
  - `placed_by`: Sales person ID
  - `on_behalf_of`: Customer ID
  - Customer sees the order normally, but internal systems track the sales person
- **Note**: Cannot impersonate Admin or other internal users

#### 5. Employee
- **Authentication**: AD login (company SSO)
- **Profile**: Linked to company AD, functions as a private customer
- **Capabilities**:
  - Shop as a private customer within the system
  - **Employee discount**: Special pricing/discount (configurable)
- **Note**: Treated like private customers but with employee benefits

### Impersonation Rules
```
Sales Person can impersonate:
  ✓ Private Member
  ✓ Professional
  ✗ Admin
  ✗ Sales Person
  ✗ Employee
```

### Pricing Hierarchy (highest to lowest priority)
1. Contract-specific pricing (Professional with active contract)
2. Project-based pricing (Professional on specific project)
3. Employee discount (Employee users)
4. Professional base pricing (tax-exempt, possible volume discounts)
5. Standard retail pricing (Private members, guests)

### Session Context
When a user is logged in, the session should track:
```typescript
interface UserSession {
  userId: string;
  userType: 'admin' | 'private' | 'professional' | 'sales' | 'employee';
  authMethod: 'password' | 'ad';

  // For impersonation (sales only)
  impersonating?: {
    customerId: string;
    customerType: 'private' | 'professional';
    startedAt: Date;
  };

  // For employees
  employeeDiscount?: number; // percentage

  // For professionals
  contracts?: ContractReference[];
  activeProject?: ProjectReference;
}
```
