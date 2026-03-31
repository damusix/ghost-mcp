import { z } from 'zod';
import type { ActionDefinition } from '../registry.js';

const webhookEvents = z.enum([
    'site.changed',
    'post.added',
    'post.deleted',
    'post.edited',
    'post.published',
    'post.published.edited',
    'post.unpublished',
    'post.scheduled',
    'post.unscheduled',
    'post.rescheduled',
    'page.added',
    'page.deleted',
    'page.edited',
    'page.published',
    'page.published.edited',
    'page.unpublished',
    'page.scheduled',
    'page.unscheduled',
    'page.rescheduled',
    'tag.added',
    'tag.edited',
    'tag.deleted',
    'post.tag.attached',
    'post.tag.detached',
    'page.tag.attached',
    'page.tag.detached',
    'member.added',
    'member.edited',
    'member.deleted',
]);

const addSchema = z.object({
    event: webhookEvents.describe('Webhook event to listen for (required)'),
    target_url: z.string().describe('URL to receive webhook POST requests (required)'),
    name: z.string().optional().describe('Human-readable name for the webhook'),
    secret: z.string().optional().describe('Shared secret for HMAC signature verification'),
    api_version: z.string().optional().describe('Target API version'),
    integration_id: z.string().optional().describe('Associated integration ID'),
});

const editSchema = z.object({
    id: z.string().describe('Webhook ID (required)'),
    event: webhookEvents.optional().describe('Webhook event'),
    target_url: z.string().optional().describe('URL to receive webhook POST requests'),
    name: z.string().optional().describe('Human-readable name'),
    secret: z.string().optional().describe('Shared secret for HMAC verification'),
    api_version: z.string().optional().describe('Target API version'),
    integration_id: z.string().optional().describe('Associated integration ID'),
});

const deleteSchema = z.object({
    id: z.string().describe('Webhook ID to delete'),
});

export const adminWebhookActions: ActionDefinition[] = [
    {
        name: 'webhooks.add',
        api: 'admin',
        method: 'POST',
        path: '/webhooks/',
        inputSchema: addSchema,
        description: 'Create a new webhook',
        example: {
            event: 'post.published',
            target_url: 'https://example.com/webhook',
            name: 'Post published',
        },
    },
    {
        name: 'webhooks.edit',
        api: 'admin',
        method: 'PUT',
        path: '/webhooks/{id}/',
        inputSchema: editSchema,
        description: 'Update an existing webhook',
    },
    {
        name: 'webhooks.delete',
        api: 'admin',
        method: 'DELETE',
        path: '/webhooks/{id}/',
        inputSchema: deleteSchema,
        description: 'Delete a webhook by ID',
    },
];
