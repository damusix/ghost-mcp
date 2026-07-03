import { z } from 'zod';
import type { ActionDefinition } from '../registry.js';

// Ghost's offers endpoint returns the full list without pagination meta;
// filter is the only browse option it honors (e.g. "status:active").
const browseParams = z.object({
    filter: z
        .string()
        .optional()
        .describe('NQL filter expression (e.g. "status:active" or "status:archived")'),
});

const readParams = z.object({
    id: z.string().describe('Offer ID'),
});

const addSchema = z.object({
    name: z.string().describe('Internal name for the offer (required)'),
    code: z.string().describe('Unique code for the offer URL (required)'),
    display_title: z.string().describe('Title shown to users (required)'),
    display_description: z.string().describe('Description shown to users (required)'),
    type: z
        .enum(['percent', 'fixed'])
        .describe('Discount type: percentage or fixed amount (required)'),
    cadence: z.enum(['month', 'year']).describe('Billing cadence the offer applies to (required)'),
    amount: z
        .number()
        .describe('Discount amount: percentage (1-100) or fixed amount in cents (required)'),
    duration: z
        .enum(['once', 'forever', 'repeating'])
        .describe('How long the discount lasts (required)'),
    duration_in_months: z.number().optional().describe('Number of months for repeating duration'),
    currency_restriction: z
        .boolean()
        .optional()
        .describe('Whether the offer is restricted to a specific currency'),
    currency: z
        .string()
        .optional()
        .describe('Three-letter ISO currency code (required for fixed type)'),
    tier: z
        .object({ id: z.string().describe('Tier ID') })
        .describe('Tier this offer applies to (required)'),
    redemption_type: z
        .enum(['signup', 'retention'])
        .optional()
        .describe('Whether the offer is for new signups or existing member retention'),
});

const editSchema = z.object({
    id: z.string().describe('Offer ID (required)'),
    name: z.string().optional().describe('Internal name'),
});

export const adminOfferActions: ActionDefinition[] = [
    {
        name: 'offers.browse',
        api: 'admin',
        method: 'GET',
        path: '/offers/',
        inputSchema: browseParams,
        description: 'Browse all offers (Ghost returns the full list; filter by status)',
        example: { filter: 'status:active' },
    },
    {
        name: 'offers.read',
        api: 'admin',
        method: 'GET',
        path: '/offers/{id}/',
        inputSchema: readParams,
        description: 'Read a single offer by ID',
    },
    {
        name: 'offers.add',
        api: 'admin',
        method: 'POST',
        path: '/offers/',
        inputSchema: addSchema,
        description: 'Create a new offer (discount code)',
        example: {
            name: 'Black Friday',
            code: 'black-friday',
            display_title: '20% Off',
            display_description: 'Black Friday special',
            type: 'percent',
            cadence: 'year',
            amount: 20,
            duration: 'once',
            tier: { id: 'tier-id' },
        },
    },
    {
        name: 'offers.edit',
        api: 'admin',
        method: 'PUT',
        path: '/offers/{id}/',
        inputSchema: editSchema,
        description: 'Update an existing offer (limited fields)',
    },
];
