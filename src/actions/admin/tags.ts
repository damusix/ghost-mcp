import { z } from 'zod';
import type { ActionDefinition } from '../registry.js';

const browseParams = z.object({
    filter: z.string().optional().describe('NQL filter expression'),
    include: z.string().optional().describe('Related data to include (e.g. "count.posts")'),
    limit: z
        .union([z.number(), z.literal('all')])
        .optional()
        .describe('Number of results per page'),
    page: z.number().optional().describe('Page number'),
    order: z.string().optional().describe('Sort order'),
});

const readParams = z.object({
    id: z.string().describe('Tag ID'),
    include: z.string().optional().describe('Related data to include'),
});

const tagWriteFields = {
    name: z.string().describe('Tag name'),
    slug: z.string().optional().describe('Tag slug (auto-generated from name if omitted)'),
    description: z.string().optional().describe('Tag description'),
    feature_image: z.string().optional().describe('Feature image URL'),
    visibility: z.string().optional().describe('Tag visibility (public or internal)'),
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
    accent_color: z.string().optional().describe('Accent color hex code'),
};

const addSchema = z.object({
    ...tagWriteFields,
    name: z.string().describe('Tag name (required)'),
});

const editSchema = z.object({
    id: z.string().describe('Tag ID (required)'),
    updated_at: z.string().describe('Last known updated_at for collision detection (required)'),
    ...tagWriteFields,
    name: z.string().optional().describe('Tag name'),
});

const deleteSchema = z.object({
    id: z.string().describe('Tag ID to delete'),
});

export const adminTagActions: ActionDefinition[] = [
    {
        name: 'tags.browse',
        api: 'admin',
        method: 'GET',
        path: '/tags/',
        inputSchema: browseParams,
        description: 'Browse all tags with filtering and pagination',
        example: { limit: 'all', include: 'count.posts' },
    },
    {
        name: 'tags.read',
        api: 'admin',
        method: 'GET',
        path: '/tags/{id}/',
        inputSchema: readParams,
        description: 'Read a single tag by ID',
    },
    {
        name: 'tags.add',
        api: 'admin',
        method: 'POST',
        path: '/tags/',
        inputSchema: addSchema,
        description: 'Create a new tag',
        example: { name: 'News', description: 'Latest news articles' },
    },
    {
        name: 'tags.edit',
        api: 'admin',
        method: 'PUT',
        path: '/tags/{id}/',
        inputSchema: editSchema,
        description: 'Update an existing tag',
    },
    {
        name: 'tags.delete',
        api: 'admin',
        method: 'DELETE',
        path: '/tags/{id}/',
        inputSchema: deleteSchema,
        description: 'Delete a tag by ID',
    },
];
