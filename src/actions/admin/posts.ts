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
    filter: z
        .string()
        .optional()
        .describe('NQL filter expression (e.g. "status:published+tag:news")'),
    limit: z
        .union([z.number(), z.literal('all')])
        .optional()
        .describe('Number of results per page (default: 15, or "all")'),
    page: z.number().optional().describe('Page number for pagination'),
    order: z.string().optional().describe('Sort order (e.g. "published_at DESC")'),
    fields: z.string().optional().describe('Comma-separated list of fields to return'),
});

const readParams = z.object({
    id: z.string().describe('Post ID'),
    include: z.string().optional().describe('Comma-separated list of related data to include'),
    formats: z.string().optional().describe('Content formats to return'),
});

const readBySlugParams = z.object({
    slug: z.string().describe('Post slug'),
    include: z.string().optional().describe('Comma-separated list of related data to include'),
    formats: z.string().optional().describe('Content formats to return'),
});

const postWriteFields = {
    title: z.string().describe('Post title'),
    lexical: z.string().optional().describe('Post content in Lexical JSON format'),
    status: z.enum(['published', 'draft', 'scheduled']).optional().describe('Post status'),
    tags: z
        .array(z.union([z.string(), z.object({ id: z.string() }), z.object({ name: z.string() })]))
        .optional()
        .describe('Tags to assign — a tag name string, or an object { id } or { name }'),
    authors: z
        .array(z.object({ id: z.string() }))
        .optional()
        .describe('Authors to assign (by id)'),
    featured: z.boolean().optional().describe('Whether the post is featured'),
    visibility: z.string().optional().describe('Post visibility (public, members, paid, tiers)'),
    published_at: z.string().optional().describe('Publication date (ISO 8601 format)'),
    custom_excerpt: z.string().optional().describe('Custom excerpt for the post'),
    meta_title: z.string().optional().describe('SEO meta title'),
    meta_description: z.string().optional().describe('SEO meta description'),
    og_image: z.string().optional().describe('Open Graph image URL'),
    og_title: z.string().optional().describe('Open Graph title'),
    og_description: z.string().optional().describe('Open Graph description'),
    twitter_image: z.string().optional().describe('Twitter card image URL'),
    twitter_title: z.string().optional().describe('Twitter card title'),
    twitter_description: z.string().optional().describe('Twitter card description'),
    codeinjection_head: z.string().optional().describe('Code injection for the post head'),
    codeinjection_foot: z.string().optional().describe('Code injection for the post footer'),
    canonical_url: z.string().optional().describe('Canonical URL for the post'),
    feature_image: z.string().optional().describe('Feature image URL'),
    feature_image_alt: z.string().optional().describe('Feature image alt text'),
    feature_image_caption: z.string().optional().describe('Feature image caption (HTML)'),
    custom_template: z.string().optional().describe('Custom template for the post'),
    newsletter: z.object({ id: z.string() }).optional().describe('Newsletter to send the post to'),
    email_subject: z
        .string()
        .optional()
        .describe('Custom email subject when sending as newsletter'),
    slug: z.string().optional().describe('Custom URL slug for the post'),
    email_only: z.boolean().optional().describe('Whether the post is email-only (not published to web)'),
    email_segment: z
        .string()
        .optional()
        .describe("NQL filter for email recipient segment (e.g. 'status:free', 'status:-free')"),
};

const addSchema = z.object({
    ...postWriteFields,
    title: z.string().describe('Post title (required)'),
});

const editSchema = z.object({
    id: z.string().describe('Post ID (required)'),
    updated_at: z
        .string()
        .describe('Last known updated_at value for collision detection (required)'),
    ...postWriteFields,
    title: z.string().optional().describe('Post title'),
});

const copySchema = z.object({
    id: z.string().describe('Post ID to copy'),
});

const deleteSchema = z.object({
    id: z.string().describe('Post ID to delete'),
});

export const adminPostActions: ActionDefinition[] = [
    {
        name: 'posts.browse',
        api: 'admin',
        method: 'GET',
        path: '/posts/',
        inputSchema: browseParams,
        description: 'Browse all posts with filtering, pagination, and sorting',
        example: { filter: 'status:published', limit: 10, include: 'authors,tags' },
    },
    {
        name: 'posts.read',
        api: 'admin',
        method: 'GET',
        path: '/posts/{id}/',
        inputSchema: readParams,
        description: 'Read a single post by ID',
        example: {
            id: '5ddc9141c35e7700383b2937',
            include: 'authors,tags',
            formats: 'html,lexical',
        },
    },
    {
        name: 'posts.read_by_slug',
        api: 'admin',
        method: 'GET',
        path: '/posts/slug/{slug}/',
        inputSchema: readBySlugParams,
        description: 'Read a single post by slug',
        example: { slug: 'my-post', include: 'authors,tags' },
    },
    {
        name: 'posts.add',
        api: 'admin',
        method: 'POST',
        path: '/posts/',
        inputSchema: addSchema,
        description: 'Create a new post',
        example: { title: 'My New Post', status: 'draft', tags: [{ name: 'News' }] },
    },
    {
        name: 'posts.edit',
        api: 'admin',
        method: 'PUT',
        path: '/posts/{id}/',
        inputSchema: editSchema,
        description: 'Update an existing post. Requires updated_at for collision detection.',
        example: {
            id: '5ddc9141c35e7700383b2937',
            updated_at: '2024-01-01T00:00:00.000Z',
            title: 'Updated Title',
        },
    },
    {
        name: 'posts.copy',
        api: 'admin',
        method: 'POST',
        path: '/posts/{id}/copy/',
        inputSchema: copySchema,
        description: 'Copy an existing post',
        example: { id: '5ddc9141c35e7700383b2937' },
    },
    {
        name: 'posts.delete',
        api: 'admin',
        method: 'DELETE',
        path: '/posts/{id}/',
        inputSchema: deleteSchema,
        description: 'Delete a post by ID',
        example: { id: '5ddc9141c35e7700383b2937' },
    },
];
