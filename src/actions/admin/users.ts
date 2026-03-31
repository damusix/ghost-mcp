import { z } from 'zod';
import type { ActionDefinition } from '../registry.js';

const browseParams = z.object({
    include: z.string().optional().describe('Related data to include (e.g. "roles,count.posts")'),
    limit: z
        .union([z.number(), z.literal('all')])
        .optional()
        .describe('Number of results per page'),
    page: z.number().optional().describe('Page number'),
    order: z.string().optional().describe('Sort order'),
});

const readParams = z.object({
    id: z.string().describe('User ID'),
    include: z.string().optional().describe('Related data to include'),
});

export const adminUserActions: ActionDefinition[] = [
    {
        name: 'users.browse',
        api: 'admin',
        method: 'GET',
        path: '/users/',
        inputSchema: browseParams,
        description: 'Browse all users (staff members)',
        example: { include: 'roles', limit: 'all' },
    },
    {
        name: 'users.read',
        api: 'admin',
        method: 'GET',
        path: '/users/{id}/',
        inputSchema: readParams,
        description: 'Read a single user by ID',
    },
];
