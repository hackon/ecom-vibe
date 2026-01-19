# Strapi Integration

This directory contains the Strapi client for the e-commerce CMS functionality.

## Overview

Strapi serves as the headless CMS for:
- **Articles**: Blog posts, policy pages, guides
- **Home Page Layout**: Dynamic home page with configurable blocks
- **Carousel Blocks**: Product carousels
- **Hero Banners**: Promotional banners

## Architecture

```
Frontend → /api/backend/v1/* → /api/3rdparty/cms/* → src/lib/cms/strapiCms.ts → 3rdParty/strapi/client.ts → Strapi API
```

### Layer Responsibilities

1. **`3rdParty/strapi/`** (This directory)
   - `client.ts`: Strapi REST API client
   - Direct communication with Strapi v5 REST API

2. **`src/lib/cms/strapiCms.ts`**
   - Backend wrapper layer
   - Transforms Strapi data to application format
   - Falls back to mock CMS if Strapi unavailable

3. **`src/app/api/3rdparty/cms/`**
   - API routes that simulate 3rd party CMS
   - Adds realistic network delays
   - Uses backend wrapper

4. **`src/app/api/backend/v1/`**
   - Backend abstraction layer
   - Frontend calls only these routes

## Quick Start

For a rapid setup, follow these steps:

```bash
# 1. Start Strapi
docker-compose up -d strapi

# 2. Create admin account at http://localhost:1337/admin

# 3. Get API token from Settings → API Tokens (Full access)
# Add to .env: STRAPI_TOKEN=your-token

# 4. Initialize content types
npm run strapi:init

# 5. Restart Strapi
docker-compose restart strapi
# Wait 30 seconds

# 6. Test connection
npm run strapi:test

# 7. Sync test data
npm run sync:strapi
```

## Detailed Setup

### 1. Start Strapi

```bash
docker-compose up -d strapi
```

Wait for Strapi to be ready (first start can take 1-2 minutes).

### 2. Create Admin Account

1. Visit http://localhost:1337/admin
2. Create your admin account (first-time setup)
3. Login to the admin panel

### 3. Create API Token

1. Go to **Settings** → **API Tokens**
2. Click **Create new API Token**
3. Give it a name (e.g., "E-commerce App")
4. Set **Token type** to **Full access**
5. Copy the token (shown only once!)

### 4. Configure Environment

Add to your `.env` file:

```bash
STRAPI_URL=http://localhost:1337
STRAPI_TOKEN=your-api-token-here
```

### 5. Create Content Types

You have two options for creating content types:

#### Option A: Automated (Recommended)

Run the initialization script to automatically create all content types:

```bash
npm run strapi:init
```

This will create:
- Article collection type
- Carousel Block collection type
- Hero Banner collection type
- Home Page single type
- Public read permissions for all types

**Important**: After running the script, restart Strapi:
```bash
docker-compose restart strapi
# Wait 30 seconds for Strapi to restart
```

#### Option B: Manual Setup

1. Log into Strapi at http://localhost:1337/admin
2. Go to **Content-Type Builder**
3. Create the following **Collection Types**:

#### Article
- **API ID (plural)**: `articles`
- **Fields**:
  - `title` (Text, required)
  - `slug` (UID, attached to title, required)
  - `excerpt` (Text)
  - `content` (Rich Text, required)
  - `image` (Text)
  - `status` (Enumeration: draft, published, archived, default: draft)

#### Carousel Block
- **API ID (plural)**: `carousel-blocks`
- **Fields**:
  - `title` (Text, required)
  - `blockType` (Text, default: "carousel")
  - `visibleCount` (Number, integer, default: 4)
  - `productIds` (Text, required, hint: "Comma-separated product SKUs")

#### Hero Banner
- **API ID (plural)**: `hero-banners`
- **Fields**:
  - `title` (Text, required)
  - `blockType` (Text, default: "hero-banner")
  - `subtitle` (Text)
  - `backgroundColor` (Text, default: "#d97706")
  - `textColor` (Text, default: "#ffffff")
  - `link` (Text)
  - `linkText` (Text)

#### Home Page
- **API ID (plural)**: `home-pages`
- **Fields**:
  - `title` (Text, required)
  - `slug` (Text, required, default: "/")
  - `blocks` (Text, required, hint: "JSON array of block documentIds")
  - `status` (Enumeration: draft, published, default: published)

### 6. Set Permissions

For each content type, set public/authenticated permissions:

1. Go to **Settings** → **Users & Permissions Plugin** → **Roles**
2. Click on **Public** role
3. Under each content type (article, carousel-block, etc.):
   - Enable **find** and **findOne** (for public read access)
4. **Save**

For API token access (already enabled with Full access token).

### 7. Test Connection

```bash
npm run strapi:test
```

This will verify:
- Connection to Strapi
- API token is valid
- Content types exist

### 8. Sync Test Data

```bash
npm run sync:strapi
```

This will:
- Create articles from mockCms
- Create carousel blocks
- Create hero banners
- Create home page with block references

### 9. Full Sync (Odoo + Solr + Strapi)

```bash
npm run sync
```

This runs the complete sync:
1. Products → Odoo
2. Odoo → Solr
3. CMS → Strapi

## Content Types

### Article

Blog posts and informational pages.

**Fields:**
- `title` (Text) - Article title
- `slug` (UID) - URL-friendly identifier (unique)
- `excerpt` (Text) - Short summary
- `content` (Rich Text) - Full article content (Markdown/HTML)
- `image` (Text) - Featured image URL
- `status` (Enum) - draft, published, archived

**Usage:**
```typescript
const article = await getArticleBySlug('free-shipping-policy');
```

### Home Page

Manages the home page layout with ordered content blocks.

**Fields:**
- `title` (Text) - Page title
- `slug` (Text) - URL path (always "/")
- `blocks` (Text) - JSON array of block documentIds (ordered)
- `status` (Enum) - draft, published

**Usage:**
```typescript
const layout = await getHomeLayout();
// Returns blocks in order
```

### Carousel Block

Product carousel widget.

**Fields:**
- `title` (Text) - Carousel title
- `blockType` (Text) - Always "carousel"
- `visibleCount` (Number) - Number of products visible at once
- `productIds` (Text) - Comma-separated product SKUs

**Example:**
```
title: "Best January Deals"
visibleCount: 4
productIds: "WD-OAK-0000, WD-BCH-0001, WD-WAL-0002, WD-BIR-0003"
```

### Hero Banner

Promotional banner widget.

**Fields:**
- `title` (Text) - Banner title
- `blockType` (Text) - Always "hero-banner"
- `subtitle` (Text) - Banner subtitle
- `backgroundColor` (Text) - Hex color code
- `textColor` (Text) - Hex color code
- `link` (Text) - URL or path
- `linkText` (Text) - Button text

**Example:**
```
title: "Free Shipping on Orders Over $99"
subtitle: "Start the new year right..."
backgroundColor: "#d97706"
textColor: "#ffffff"
link: "/article/free-shipping-policy"
linkText: "Learn More"
```

## Usage Examples

### Fetching Home Layout

```typescript
import { getHomeLayout } from '@/lib/cms/strapiCms';

const layout = await getHomeLayout();
// layout.blocks contains ordered array of carousel and hero blocks
```

### Fetching Article

```typescript
import { getArticleBySlug } from '@/lib/cms/strapiCms';

const article = await getArticleBySlug('beginner-woodworking-guide');
// article.content contains Rich Text/Markdown
```

### Creating New Content (via Strapi client)

```typescript
import { createStrapiClient } from '@/3rdParty/strapi/client';

const client = createStrapiClient();

const article = await client.createArticle({
  title: 'New Article',
  slug: 'new-article',
  excerpt: 'Short summary',
  content: '# Full content here',
  status: 'published',
});
```

## Fallback Behavior

If Strapi is unavailable or `STRAPI_TOKEN` is not set, the system automatically falls back to `mockCms.ts`. This ensures:
- Development works without Strapi
- Graceful degradation in production
- No breaking changes

## Troubleshooting

### Connection Fails

```bash
# Check Docker
docker ps

# Check Strapi logs
docker-compose logs strapi

# Verify Strapi is running
curl http://localhost:1337/api/articles

# Check environment
echo $STRAPI_TOKEN
```

### API Token Invalid

1. Get a new API token from Strapi admin
2. Update `.env`
3. Restart dev server: `npm run dev`

### Content Types Not Found

Create them manually through the Strapi admin UI as described above.

### Strapi Not Starting

```bash
# Check if port 1337 is available
lsof -i :1337

# Restart Strapi
docker-compose restart strapi

# Check logs for errors
docker-compose logs strapi
```

## Admin Access

- **URL**: http://localhost:1337/admin
- **Credentials**: Created during first setup
- **API Docs**: http://localhost:1337/documentation (if enabled)

## API Reference

See `client.ts` for full API documentation.

Key methods:
- `getArticles()` - List all articles
- `getArticleBySlug(slug)` - Get article by slug
- `createArticle(article)` - Create new article
- `updateArticle(id, article)` - Update existing article
- `getHomePage()` - Get home page layout
- `createCarouselBlock(block)` - Create carousel block
- `createHeroBanner(banner)` - Create hero banner
- `testConnection()` - Test API connection

## Strapi Resources

- **Official Documentation**: https://docs.strapi.io/
- **REST API Reference**: https://docs.strapi.io/cms/api/rest
- **API Tokens**: https://docs.strapi.io/cms/features/api-tokens
- **Content-Type Builder**: https://docs.strapi.io/cms/features/content-type-builder
