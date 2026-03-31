import { z } from 'zod';
import type { ActionDefinition } from '../registry.js';

const browseParams = z.object({
    include: z
        .string()
        .optional()
        .describe('Comma-separated list of related data to include (e.g. "authors,tags")'),
    formats: z
        .string()
        .optional()
        .describe('Content formats to return: "html", "lexical", "plaintext" (comma-separated)'),
    filter: z.string().optional().describe('NQL filter expression'),
    limit: z
        .union([z.number(), z.literal('all')])
        .optional()
        .describe('Number of results per page (default: 15, or "all")'),
    page: z.number().optional().describe('Page number for pagination'),
    order: z.string().optional().describe('Sort order (e.g. "published_at DESC")'),
    fields: z.string().optional().describe('Comma-separated list of fields to return'),
});

const readParams = z.object({
    id: z.string().describe('Page ID'),
    include: z.string().optional().describe('Comma-separated list of related data to include'),
    formats: z.string().optional().describe('Content formats to return'),
});

const readBySlugParams = z.object({
    slug: z.string().describe('Page slug'),
    include: z.string().optional().describe('Comma-separated list of related data to include'),
    formats: z.string().optional().describe('Content formats to return'),
});

const pageWriteFields = {
    title: z.string().describe('Page title'),
    lexical: z.string().optional().describe('Page content in Lexical JSON format'),
    status: z.enum(['published', 'draft', 'scheduled']).optional().describe('Page status'),
    tags: z
        .array(z.union([z.object({ id: z.string() }), z.object({ name: z.string() })]))
        .optional()
        .describe('Tags to assign (by id or name)'),
    authors: z
        .array(z.object({ id: z.string() }))
        .optional()
        .describe('Authors to assign (by id)'),
    featured: z.boolean().optional().describe('Whether the page is featured'),
    visibility: z.string().optional().describe('Page visibility'),
    published_at: z.string().optional().describe('Publication date (ISO 8601)'),
    custom_excerpt: z.string().optional().describe('Custom excerpt'),
    meta_title: z.string().optional().describe('SEO meta title'),
    meta_description: z.string().optional().describe('SEO meta description'),
    og_image: z.string().optional().describe('Open Graph image URL'),
    og_title: z.string().optional().describe('Open Graph title'),
    og_description: z.string().optional().describe('Open Graph description'),
    twitter_image: z.string().optional().describe('Twitter card image URL'),
    twitter_title: z.string().optional().describe('Twitter card title'),
    twitter_description: z.string().optional().describe('Twitter card description'),
    codeinjection_head: z.string().optional().describe('Code injection for head'),
    codeinjection_foot: z.string().optional().describe('Code injection for footer'),
    canonical_url: z.string().optional().describe('Canonical URL'),
    feature_image: z.string().optional().describe('Feature image URL'),
    feature_image_alt: z.string().optional().describe('Feature image alt text'),
    feature_image_caption: z.string().optional().describe('Feature image caption (HTML)'),
    custom_template: z.string().optional().describe('Custom template'),
};

const addSchema = z.object({
    ...pageWriteFields,
    title: z.string().describe('Page title (required)'),
});

const editSchema = z.object({
    id: z.string().describe('Page ID (required)'),
    updated_at: z.string().describe('Last known updated_at for collision detection (required)'),
    ...pageWriteFields,
    title: z.string().optional().describe('Page title'),
});

const copySchema = z.object({ id: z.string().describe('Page ID to copy') });
const deleteSchema = z.object({ id: z.string().describe('Page ID to delete') });

export const adminPageActions: ActionDefinition[] = [
    {
        name: 'pages.browse',
        api: 'admin',
        method: 'GET',
        path: '/pages/',
        inputSchema: browseParams,
        description: 'Browse all pages with filtering, pagination, and sorting',
        example: { filter: 'status:published', limit: 10 },
    },
    {
        name: 'pages.read',
        api: 'admin',
        method: 'GET',
        path: '/pages/{id}/',
        inputSchema: readParams,
        description: 'Read a single page by ID',
    },
    {
        name: 'pages.read_by_slug',
        api: 'admin',
        method: 'GET',
        path: '/pages/slug/{slug}/',
        inputSchema: readBySlugParams,
        description: 'Read a single page by slug',
    },
    {
        name: 'pages.add',
        api: 'admin',
        method: 'POST',
        path: '/pages/',
        inputSchema: addSchema,
        description: 'Create a new page',
        example: { title: 'About Us', status: 'draft' },
    },
    {
        name: 'pages.edit',
        api: 'admin',
        method: 'PUT',
        path: '/pages/{id}/',
        inputSchema: editSchema,
        description: 'Update an existing page. Requires updated_at for collision detection.',
    },
    {
        name: 'pages.copy',
        api: 'admin',
        method: 'POST',
        path: '/pages/{id}/copy/',
        inputSchema: copySchema,
        description: 'Copy an existing page',
    },
    {
        name: 'pages.delete',
        api: 'admin',
        method: 'DELETE',
        path: '/pages/{id}/',
        inputSchema: deleteSchema,
        description: 'Delete a page by ID',
    },
];
