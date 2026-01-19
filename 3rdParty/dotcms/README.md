# DotCMS Integration

This directory contains the DotCMS client and content type definitions for the e-commerce CMS functionality.

## Overview

DotCMS serves as the content management system for:
- **Articles**: Blog posts, policy pages, guides
- **Home Page Layout**: Dynamic home page with configurable blocks
- **Carousel Blocks**: Product carousels
- **Hero Banners**: Promotional banners

## Architecture

```
Frontend → /api/backend/v1/* → /api/3rdparty/cms/* → src/lib/cms/dotCms.ts → 3rdParty/dotcms/client.ts → DotCMS API
```

### Layer Responsibilities

1. **`3rdParty/dotcms/`** (This directory)
   - `client.ts`: DotCMS REST API client
   - `schemas.ts`: Content type definitions
   - Direct communication with DotCMS

2. **`src/lib/cms/dotCms.ts`**
   - Backend wrapper layer
   - Transforms DotCMS data to application format
   - Falls back to mock CMS if DotCMS unavailable

3. **`src/app/api/3rdparty/cms/`**
   - API routes that simulate 3rd party CMS
   - Adds realistic network delays
   - Uses backend wrapper

4. **`src/app/api/backend/v1/`**
   - Backend abstraction layer
   - Frontend calls only these routes

## Setup

### 1. Start DotCMS

```bash
docker-compose up -d dotcms
```

Wait for DotCMS to be healthy (can take 2-3 minutes on first start):

```bash
docker-compose ps dotcms
```

### 2. Get API Key

1. Visit http://localhost:8082
2. Login with `admin` / `admin`
3. Go to **System → API Tokens**
4. Click **Create Token**
5. Give it a name (e.g., "E-commerce Sync")
6. Copy the token

### 3. Configure Environment

Add to your `.env` file:

```bash
DOTCMS_URL=http://localhost:8082
DOTCMS_API_KEY=your-api-key-here
```

### 4. Test Connection

```bash
npm run dotcms:test
```

This will verify:
- Connection to DotCMS
- API key is valid
- Content types exist (if synced)
- Content exists (if synced)

### 5. Create Content Types

**Note**: Automatic content type creation via API is currently not working due to DotCMS API limitations. Content types need to be created manually through the DotCMS UI.

#### Manual Setup (Recommended)

1. Log into DotCMS at http://localhost:8082
2. Go to **Content Types** → **Add Content Type**
3. Create the following content types following the schemas in `schemas.ts`:
   - Article
   - HomePage
   - CarouselBlock
   - HeroBanner

Or use the sync script (experimental):
```bash
npm run sync:dotcms
```

**Current Status**: The sync script has API compatibility issues and may not work correctly. Manual setup through DotCMS UI is recommended.

### 6. Full Sync (Odoo + Solr + DotCMS)

```bash
npm run sync
```

This runs the complete sync:
1. Products → Odoo
2. Odoo → Solr
3. CMS → DotCMS

## Content Types

### Article

Blog posts and informational pages.

**Fields:**
- `title` (Text) - Article title
- `slug` (Text) - URL-friendly identifier (unique)
- `excerpt` (Textarea) - Short summary
- `content` (WYSIWYG) - Full article content (Markdown)
- `image` (Text) - Featured image URL
- `status` (Select) - draft, published, archived

**Usage:**
```typescript
const article = await getArticleBySlug('free-shipping-policy');
```

### Home Page

Manages the home page layout with ordered content blocks.

**Fields:**
- `title` (Text) - Page title
- `slug` (Text) - URL path (always "/")
- `blocks` (Textarea) - JSON array of block identifiers (ordered)
- `status` (Select) - draft, published

**Usage:**
```typescript
const layout = await getHomeLayout();
// Returns blocks in order
```

### Carousel Block

Product carousel widget.

**Fields:**
- `title` (Text) - Carousel title
- `blockType` (Hidden) - Always "carousel"
- `visibleCount` (Integer) - Number of products visible at once
- `productIds` (Textarea) - Comma-separated product SKUs

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
- `blockType` (Hidden) - Always "hero-banner"
- `subtitle` (Textarea) - Banner subtitle
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
import { getHomeLayout } from '@/lib/cms/dotCms';

const layout = await getHomeLayout();
// layout.blocks contains ordered array of carousel and hero blocks
```

### Fetching Article

```typescript
import { getArticleBySlug } from '@/lib/cms/dotCms';

const article = await getArticleBySlug('beginner-woodworking-guide');
// article.content contains Markdown
```

### Creating New Content (via DotCMS client)

```typescript
import { createDotCMSClient } from '@/3rdParty/dotcms/client';

const client = createDotCMSClient();

const article = await client.createContent({
  contentType: 'Article',
  title: 'New Article',
  slug: 'new-article',
  excerpt: 'Short summary',
  content: '# Full content here',
  status: 'published',
  languageId: 1,
});

await client.publishContent(article.identifier!);
```

## Fallback Behavior

If DotCMS is unavailable or `DOTCMS_API_KEY` is not set, the system automatically falls back to `mockCms.ts`. This ensures:
- Development works without DotCMS
- Graceful degradation in production
- No breaking changes

## Troubleshooting

### Connection Fails

```bash
# Check Docker
docker ps

# Check DotCMS logs
docker-compose logs dotcms

# Verify DotCMS is healthy
curl http://localhost:8082/api/v1/contenttype

# Check environment
echo $DOTCMS_API_KEY
```

### Content Types Not Found

```bash
npm run sync:dotcms
```

### API Key Invalid

1. Get a new API key from DotCMS admin
2. Update `.env`
3. Restart dev server: `npm run dev`

### DotCMS Not Starting

```bash
# Check dependencies
docker-compose ps db opensearch

# DotCMS requires both PostgreSQL and OpenSearch
docker-compose up -d db opensearch

# Wait for them to be healthy, then start DotCMS
docker-compose up -d dotcms
```

## Admin Access

- **URL**: http://localhost:8082
- **Default credentials**: `admin` / `admin`
- **Change password**: System → Users → admin

## API Reference

See `client.ts` for full API documentation.

Key methods:
- `getContentTypes()` - List all content types
- `createContentType(type)` - Create new content type
- `searchContent(query)` - Search for content
- `getContent(identifier)` - Get content by ID
- `createContent(content)` - Create new content
- `updateContent(id, content)` - Update existing content
- `publishContent(identifier)` - Publish content
- `testConnection()` - Test API connection
