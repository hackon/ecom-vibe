# Strapi CMS Setup Guide

Quick reference for setting up and using Strapi as the CMS backend.

## Prerequisites

- Docker and docker-compose installed
- Node.js and npm installed
- `.env` file with `STRAPI_URL` and `STRAPI_TOKEN`

## Step-by-Step Setup

### 1. Start Strapi Container

```bash
docker-compose up -d strapi
```

Wait for Strapi to start (first time can take 1-2 minutes).

### 2. Create Admin Account

1. Open browser: http://localhost:1337/admin
2. Fill in admin account details (first-time setup)
3. Login to Strapi admin panel

### 3. Generate API Token

1. Go to **Settings** (gear icon in sidebar)
2. Click **API Tokens** under "Global Settings"
3. Click **Create new API Token**
4. Fill in:
   - **Name**: `E-commerce App`
   - **Token type**: **Full access**
   - **Token duration**: Unlimited (or set expiration)
5. Click **Save**
6. **Copy the token** (shown only once!)

### 4. Configure Environment

Add the token to your `.env` file:

```bash
STRAPI_URL=http://localhost:1337
STRAPI_TOKEN=your-copied-token-here
```

### 5. Initialize Content Types (Automated)

Run the initialization script to create all content types automatically:

```bash
npm run strapi:init
```

This creates:
- ✓ Article collection type
- ✓ Carousel Block collection type
- ✓ Hero Banner collection type
- ✓ Home Page single type
- ✓ Public read permissions

### 6. Restart Strapi

Content type changes require a restart:

```bash
docker-compose restart strapi
```

Wait ~30 seconds for Strapi to fully restart.

### 7. Test Connection

Verify everything is working:

```bash
npm run strapi:test
```

Expected output:
```
✓ Connected to Strapi successfully
✓ Found 0 articles (no content yet)
⚠ No articles found - Run: npm run sync:strapi
```

### 8. Sync Test Data

Populate Strapi with initial test data from mockCms:

```bash
npm run sync:strapi
```

This creates:
- Sample articles (Free Shipping Policy, Woodworking Guide)
- Carousel blocks for product displays
- Hero banners for promotions
- Home page layout with blocks

### 9. Verify Data

Check the admin UI:
- Articles: http://localhost:1337/admin/content-manager/collection-types/api::article.article
- Carousel Blocks: http://localhost:1337/admin/content-manager/collection-types/api::carousel-block.carousel-block
- Hero Banners: http://localhost:1337/admin/content-manager/collection-types/api::hero-banner.hero-banner
- Home Page: http://localhost:1337/admin/content-manager/single-types/api::home-page.home-page

## Complete Sync (Products + CMS)

To sync both products and CMS content:

```bash
npm run sync
```

This runs:
1. Products → Odoo
2. Odoo → Solr
3. Mock CMS → Strapi

## Troubleshooting

### Token Invalid

**Symptom**: `401 Unauthorized` errors

**Solution**:
1. Generate a new token in Strapi admin
2. Update `.env` with new token
3. Restart dev server: `npm run dev`

### Content Types Not Found

**Symptom**: `404` errors when fetching content

**Solution**:
1. Check content types exist: http://localhost:1337/admin/plugins/content-type-builder
2. If missing, run `npm run strapi:init`
3. Restart Strapi: `docker-compose restart strapi`

### Strapi Won't Start

**Check container status**:
```bash
docker-compose ps strapi
docker-compose logs strapi
```

**Common fixes**:
```bash
# Restart container
docker-compose restart strapi

# Full reset (WARNING: deletes all data)
docker-compose down
docker volume rm ecom_strapi_data
docker-compose up -d strapi
```

### Permission Denied Errors

**Symptom**: `403 Forbidden` when fetching content

**Solution**:
1. Go to **Settings** → **Users & Permissions Plugin** → **Roles**
2. Click **Public** role
3. Enable `find` and `findOne` for each content type
4. Click **Save**

## Scripts Reference

| Script | Description |
|--------|-------------|
| `npm run strapi:init` | Initialize Strapi with content types |
| `npm run strapi:test` | Test connection and verify setup |
| `npm run sync:strapi` | Sync test data to Strapi |
| `npm run sync` | Full sync (Odoo + Solr + Strapi) |

## API Endpoints

### Content Endpoints

```bash
# Articles
GET  /api/articles
GET  /api/articles/:documentId
GET  /api/articles?filters[slug][$eq]=my-slug

# Carousel Blocks
GET  /api/carousel-blocks
GET  /api/carousel-blocks/:documentId

# Hero Banners
GET  /api/hero-banners
GET  /api/hero-banners/:documentId

# Home Page
GET  /api/home-pages
```

### Example API Call

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:1337/api/articles
```

## Content Structure

### Article
```json
{
  "data": {
    "id": 1,
    "documentId": "abc123",
    "title": "My Article",
    "slug": "my-article",
    "excerpt": "Short description",
    "content": "Full article content...",
    "image": "https://example.com/image.jpg",
    "status": "published",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Home Page
```json
{
  "data": {
    "id": 1,
    "documentId": "home123",
    "title": "Home",
    "slug": "/",
    "blocks": [
      { "type": "carousel", "id": "carousel-doc-id" },
      { "type": "hero-banner", "id": "hero-doc-id" }
    ],
    "status": "published"
  }
}
```

## Resources

- **Strapi Admin**: http://localhost:1337/admin
- **Strapi Docs**: https://docs.strapi.io/
- **REST API Docs**: https://docs.strapi.io/cms/api/rest
- **Content-Type Builder**: https://docs.strapi.io/cms/features/content-type-builder

## Environment Variables

Required in `.env`:

```bash
STRAPI_URL=http://localhost:1337
STRAPI_TOKEN=your-api-token-here
```

## Docker Commands

```bash
# Start Strapi
docker-compose up -d strapi

# Stop Strapi
docker-compose stop strapi

# Restart Strapi
docker-compose restart strapi

# View logs
docker-compose logs -f strapi

# Remove Strapi (keeps data)
docker-compose stop strapi
docker-compose rm strapi

# Remove Strapi with data (WARNING: destructive)
docker-compose down
docker volume rm ecom_strapi_data
```
