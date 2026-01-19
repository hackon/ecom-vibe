/**
 * DotCMS Content Type Schemas
 *
 * Defines the content types needed for the e-commerce CMS:
 * - Article: Blog posts and informational pages
 * - HomePage: Home page layout with blocks
 * - CarouselBlock: Product carousel widget
 * - HeroBanner: Hero banner widget
 */

import { DotCMSContentType } from './client';

/**
 * Article Content Type
 * Used for blog posts, policy pages, guides, etc.
 */
export const ArticleContentType: DotCMSContentType = {
  name: 'Article',
  variable: 'Article',
  description: 'Blog posts and informational content',
  baseType: 'CONTENT',
  clazz: 'com.dotcms.contenttype.model.type.ImmutableSimpleContentType',
  defaultType: false,
  fixed: false,
  system: false,
  folder: 'SYSTEM_FOLDER',
  icon: 'article',
  fields: [
    {
      name: 'Title',
      variable: 'title',
      fieldType: 'com.dotcms.contenttype.model.field.ImmutableTextField',
      dataType: 'TEXT',
      required: true,
      indexed: true,
      listed: true,
      searchable: true,
      sortOrder: 1,
    },
    {
      name: 'Slug',
      variable: 'slug',
      fieldType: 'com.dotcms.contenttype.model.field.ImmutableTextField',
      dataType: 'TEXT',
      required: true,
      indexed: true,
      listed: true,
      unique: true,
      hint: 'URL-friendly identifier',
      sortOrder: 2,
    },
    {
      name: 'Excerpt',
      variable: 'excerpt',
      fieldType: 'com.dotcms.contenttype.model.field.ImmutableTextAreaField',
      dataType: 'LONG_TEXT',
      required: false,
      indexed: false,
      listed: true,
      hint: 'Short summary for listings',
      sortOrder: 3,
    },
    {
      name: 'Content',
      variable: 'content',
      fieldType: 'com.dotcms.contenttype.model.field.ImmutableWysiwygField',
      dataType: 'LONG_TEXT',
      required: true,
      indexed: false,
      listed: false,
      searchable: true,
      sortOrder: 4,
    },
    {
      name: 'Image',
      variable: 'image',
      fieldType: 'com.dotcms.contenttype.model.field.ImmutableTextField',
      dataType: 'TEXT',
      required: false,
      indexed: false,
      listed: false,
      hint: 'Featured image URL',
      sortOrder: 5,
    },
    {
      name: 'Status',
      variable: 'status',
      fieldType: 'com.dotcms.contenttype.model.field.ImmutableSelectField',
      dataType: 'TEXT',
      required: true,
      indexed: true,
      listed: true,
      defaultValue: 'draft',
      values: 'draft|Draft\npublished|Published\narchived|Archived',
      sortOrder: 6,
    },
  ],
};

/**
 * Carousel Block Content Type
 * Product carousel widget for home page
 */
export const CarouselBlockContentType: DotCMSContentType = {
  name: 'Carousel Block',
  variable: 'CarouselBlock',
  description: 'Product carousel widget',
  baseType: 'CONTENT',
  clazz: 'com.dotcms.contenttype.model.type.ImmutableSimpleContentType',
  defaultType: false,
  fixed: false,
  system: false,
  folder: 'SYSTEM_FOLDER',
  icon: 'view_carousel',
  fields: [
    {
      name: 'Title',
      variable: 'title',
      fieldType: 'com.dotcms.contenttype.model.field.ImmutableTextField',
      dataType: 'TEXT',
      required: true,
      indexed: true,
      listed: true,
      sortOrder: 1,
    },
    {
      name: 'Block Type',
      variable: 'blockType',
      fieldType: 'com.dotcms.contenttype.model.field.ImmutableHiddenField',
      dataType: 'TEXT',
      required: true,
      indexed: false,
      listed: false,
      defaultValue: 'carousel',
      sortOrder: 2,
    },
    {
      name: 'Visible Count',
      variable: 'visibleCount',
      fieldType: 'com.dotcms.contenttype.model.field.ImmutableTextField',
      dataType: 'INTEGER',
      required: true,
      indexed: false,
      listed: false,
      defaultValue: '4',
      hint: 'Number of products visible at once',
      sortOrder: 3,
    },
    {
      name: 'Product IDs',
      variable: 'productIds',
      fieldType: 'com.dotcms.contenttype.model.field.ImmutableTextAreaField',
      dataType: 'LONG_TEXT',
      required: true,
      indexed: false,
      listed: false,
      hint: 'Comma-separated list of product SKUs',
      sortOrder: 4,
    },
  ],
};

/**
 * Hero Banner Content Type
 * Hero banner widget for home page
 */
export const HeroBannerContentType: DotCMSContentType = {
  name: 'Hero Banner',
  variable: 'HeroBanner',
  description: 'Hero banner widget',
  baseType: 'CONTENT',
  clazz: 'com.dotcms.contenttype.model.type.ImmutableSimpleContentType',
  defaultType: false,
  fixed: false,
  system: false,
  folder: 'SYSTEM_FOLDER',
  icon: 'panorama',
  fields: [
    {
      name: 'Title',
      variable: 'title',
      fieldType: 'com.dotcms.contenttype.model.field.ImmutableTextField',
      dataType: 'TEXT',
      required: true,
      indexed: true,
      listed: true,
      sortOrder: 1,
    },
    {
      name: 'Block Type',
      variable: 'blockType',
      fieldType: 'com.dotcms.contenttype.model.field.ImmutableHiddenField',
      dataType: 'TEXT',
      required: true,
      indexed: false,
      listed: false,
      defaultValue: 'hero-banner',
      sortOrder: 2,
    },
    {
      name: 'Subtitle',
      variable: 'subtitle',
      fieldType: 'com.dotcms.contenttype.model.field.ImmutableTextAreaField',
      dataType: 'LONG_TEXT',
      required: false,
      indexed: false,
      listed: false,
      sortOrder: 3,
    },
    {
      name: 'Background Color',
      variable: 'backgroundColor',
      fieldType: 'com.dotcms.contenttype.model.field.ImmutableTextField',
      dataType: 'TEXT',
      required: true,
      indexed: false,
      listed: false,
      defaultValue: '#d97706',
      hint: 'Hex color code',
      sortOrder: 4,
    },
    {
      name: 'Text Color',
      variable: 'textColor',
      fieldType: 'com.dotcms.contenttype.model.field.ImmutableTextField',
      dataType: 'TEXT',
      required: true,
      indexed: false,
      listed: false,
      defaultValue: '#ffffff',
      hint: 'Hex color code',
      sortOrder: 5,
    },
    {
      name: 'Link',
      variable: 'link',
      fieldType: 'com.dotcms.contenttype.model.field.ImmutableTextField',
      dataType: 'TEXT',
      required: false,
      indexed: false,
      listed: false,
      hint: 'URL or path',
      sortOrder: 6,
    },
    {
      name: 'Link Text',
      variable: 'linkText',
      fieldType: 'com.dotcms.contenttype.model.field.ImmutableTextField',
      dataType: 'TEXT',
      required: false,
      indexed: false,
      listed: false,
      hint: 'Button text',
      sortOrder: 7,
    },
  ],
};

/**
 * Home Page Content Type
 * Manages home page layout with blocks
 */
export const HomePageContentType: DotCMSContentType = {
  name: 'Home Page',
  variable: 'HomePage',
  description: 'Home page layout with content blocks',
  baseType: 'CONTENT',
  clazz: 'com.dotcms.contenttype.model.type.ImmutableSimpleContentType',
  defaultType: false,
  fixed: false,
  system: false,
  folder: 'SYSTEM_FOLDER',
  icon: 'home',
  fields: [
    {
      name: 'Title',
      variable: 'title',
      fieldType: 'com.dotcms.contenttype.model.field.ImmutableTextField',
      dataType: 'TEXT',
      required: true,
      indexed: true,
      listed: true,
      sortOrder: 1,
    },
    {
      name: 'Slug',
      variable: 'slug',
      fieldType: 'com.dotcms.contenttype.model.field.ImmutableTextField',
      dataType: 'TEXT',
      required: true,
      indexed: true,
      listed: true,
      defaultValue: '/',
      hint: 'URL path',
      sortOrder: 2,
    },
    {
      name: 'Blocks',
      variable: 'blocks',
      fieldType: 'com.dotcms.contenttype.model.field.ImmutableTextAreaField',
      dataType: 'LONG_TEXT',
      required: true,
      indexed: false,
      listed: false,
      hint: 'JSON array of block identifiers (ordered)',
      sortOrder: 3,
    },
    {
      name: 'Status',
      variable: 'status',
      fieldType: 'com.dotcms.contenttype.model.field.ImmutableSelectField',
      dataType: 'TEXT',
      required: true,
      indexed: true,
      listed: true,
      defaultValue: 'published',
      values: 'draft|Draft\npublished|Published',
      sortOrder: 4,
    },
  ],
};

/**
 * All content types to be created
 */
export const ALL_CONTENT_TYPES: DotCMSContentType[] = [
  ArticleContentType,
  CarouselBlockContentType,
  HeroBannerContentType,
  HomePageContentType,
];
