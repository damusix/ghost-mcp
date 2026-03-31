import { z } from 'zod';
import type { ActionDefinition } from '../registry.js';

const browseParams = z.object({
    include: z.string().optional().describe('Related data to include (e.g. "count.posts")'),
    filter: z.string().optional().describe('NQL filter expression'),
    limit: z
        .union([z.number(), z.literal('all')])
        .optional()
        .describe('Number of results per page'),
    page: z.number().optional().describe('Page number'),
    order: z.string().optional().describe('Sort order'),
    fields: z.string().optional().describe('Comma-separated list of fields to return'),
});

const readParams = z.object({
    id: z.string().describe('Author ID'),
    include: z.string().optional().describe('Related data to include'),
});

const readBySlugParams = z.object({
    slug: z.string().describe('Author slug'),
    include: z.string().optional().describe('Related data to include'),
});

export const contentAuthorActions: ActionDefinition[] = [
    {
        name: 'authors.browse',
        api: 'content',
        method: 'GET',
        path: '/authors/',
        inputSchema: browseParams,
        description: 'Browse all authors (Content API — read-only)',
        example: { include: 'count.posts' },
    },
    {
        name: 'authors.read',
        api: 'content',
        method: 'GET',
        path: '/authors/{id}/',
        inputSchema: readParams,
        description: 'Read an author by ID (Content API)',
    },
    {
        name: 'authors.read_by_slug',
        api: 'content',
        method: 'GET',
        path: '/authors/slug/{slug}/',
        inputSchema: readBySlugParams,
        description: 'Read an author by slug (Content API)',
    },
];
