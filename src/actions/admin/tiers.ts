import { z } from 'zod';
import type { ActionDefinition } from '../registry.js';

const browseParams = z.object({
    filter: z.string().optional().describe('NQL filter expression (e.g. "type:paid+active:true")'),
    include: z
        .string()
        .optional()
        .describe('Related data to include (e.g. "monthly_price,yearly_price,benefits")'),
    limit: z
        .union([z.number(), z.literal('all')])
        .optional()
        .describe('Number of results per page'),
    page: z.number().optional().describe('Page number'),
    order: z.string().optional().describe('Sort order'),
});

const readParams = z.object({
    id: z.string().describe('Tier ID'),
    include: z.string().optional().describe('Related data to include'),
});

const tierWriteFields = {
    name: z.string().describe('Tier name'),
    description: z.string().optional().describe('Tier description'),
    welcome_page_url: z.string().optional().describe('URL of the welcome page for new subscribers'),
    visibility: z.enum(['public', 'none']).optional().describe('Tier visibility'),
    monthly_price: z
        .number()
        .optional()
        .describe('Monthly price in smallest currency unit (e.g. cents)'),
    yearly_price: z.number().optional().describe('Yearly price in smallest currency unit'),
    currency: z.string().optional().describe('Three-letter ISO currency code (e.g. "usd")'),
    benefits: z.array(z.string()).optional().describe('List of benefits for this tier'),
};

const addSchema = z.object({
    ...tierWriteFields,
    name: z.string().describe('Tier name (required)'),
});

const editSchema = z.object({
    id: z.string().describe('Tier ID (required)'),
    ...tierWriteFields,
    name: z.string().optional().describe('Tier name'),
});

export const adminTierActions: ActionDefinition[] = [
    {
        name: 'tiers.browse',
        api: 'admin',
        method: 'GET',
        path: '/tiers/',
        inputSchema: browseParams,
        description: 'Browse all tiers with filtering and pagination',
        example: {
            filter: 'type:paid+active:true',
            include: 'monthly_price,yearly_price,benefits',
        },
    },
    {
        name: 'tiers.read',
        api: 'admin',
        method: 'GET',
        path: '/tiers/{id}/',
        inputSchema: readParams,
        description: 'Read a single tier by ID',
    },
    {
        name: 'tiers.add',
        api: 'admin',
        method: 'POST',
        path: '/tiers/',
        inputSchema: addSchema,
        description: 'Create a new tier',
        example: { name: 'Premium', monthly_price: 500, yearly_price: 5000, currency: 'usd' },
    },
    {
        name: 'tiers.edit',
        api: 'admin',
        method: 'PUT',
        path: '/tiers/{id}/',
        inputSchema: editSchema,
        description: 'Update an existing tier',
    },
];
