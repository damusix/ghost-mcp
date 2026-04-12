import { z } from 'zod';
import type { ActionDefinition } from '../registry.js';

const browseParams = z.object({
    limit: z
        .union([z.number(), z.literal('all')])
        .optional()
        .describe('Number of results per page'),
    page: z.number().optional().describe('Page number'),
    order: z.string().optional().describe('Sort order'),
    filter: z.string().optional().describe('NQL filter expression'),
    include: z
        .string()
        .optional()
        .describe("Related data to include (e.g. 'count.posts,count.members,count.active_members')"),
});

const readParams = z.object({
    id: z.string().describe('Newsletter ID'),
});

const newsletterWriteFields = {
    name: z.string().describe('Newsletter name'),
    description: z.string().optional().describe('Newsletter description'),
    slug: z.string().optional().describe('Newsletter slug'),
    sender_name: z.string().optional().describe('Sender name in emails'),
    sender_email: z.string().optional().describe('Sender email address (must be validated)'),
    sender_reply_to: z.enum(['newsletter', 'support']).optional().describe('Reply-to address type'),
    status: z.enum(['active', 'archived']).optional().describe('Newsletter status'),
    visibility: z.string().optional().describe('Newsletter visibility'),
    subscribe_on_signup: z.boolean().optional().describe('Auto-subscribe new members'),
    sort_order: z.number().optional().describe('Sort order position'),
    header_image: z.string().optional().describe('Header image URL'),
    show_header_icon: z.boolean().optional().describe('Show site icon in header'),
    show_header_title: z.boolean().optional().describe('Show site title in header'),
    show_header_name: z.boolean().optional().describe('Show newsletter name in header'),
    title_font_category: z.enum(['serif', 'sans_serif']).optional().describe('Title font category'),
    title_alignment: z.enum(['left', 'center']).optional().describe('Title alignment'),
    show_feature_image: z.boolean().optional().describe('Show feature image in emails'),
    body_font_category: z.enum(['serif', 'sans_serif']).optional().describe('Body font category'),
    footer_content: z.string().optional().describe('Footer content (HTML)'),
    show_badge: z.boolean().optional().describe('Show Ghost badge in footer'),
    feedback_enabled: z.boolean().optional().describe('Enable email feedback/reactions'),
    show_excerpt: z.boolean().optional().describe('Show post excerpt in emails'),
    show_post_title_section: z.boolean().optional().describe('Show post title section'),
    show_comment_cta: z.boolean().optional().describe('Show comment call-to-action'),
    show_subscription_details: z.boolean().optional().describe('Show subscription details'),
    show_latest_posts: z.boolean().optional().describe('Show latest posts section'),
    show_share_button: z.boolean().optional().describe('Show share button'),
    background_color: z.string().optional().describe("Background color (e.g. 'light', 'dark', or hex)"),
    post_title_color: z.string().nullable().optional().describe('Post title color (hex)'),
    button_corners: z
        .enum(['square', 'rounded', 'pill'])
        .optional()
        .describe('Button corner style'),
    button_style: z.enum(['fill', 'outline']).optional().describe('Button style'),
    title_font_weight: z
        .enum(['normal', 'medium', 'semibold', 'bold'])
        .optional()
        .describe('Title font weight'),
    link_style: z.enum(['underline', 'regular', 'bold']).optional().describe('Link style in emails'),
    image_corners: z.enum(['square', 'rounded']).optional().describe('Image corner style'),
    header_background_color: z
        .string()
        .optional()
        .describe("Header background color (e.g. 'transparent', hex, 'accent')"),
    section_title_color: z.string().nullable().optional().describe('Section title color (hex)'),
    divider_color: z.string().nullable().optional().describe('Divider color (hex)'),
    button_color: z.string().optional().describe("Button color (e.g. 'accent', hex)"),
    link_color: z.string().optional().describe("Link color (e.g. 'accent', hex)"),
};

const addSchema = z.object({
    ...newsletterWriteFields,
    name: z.string().describe('Newsletter name (required)'),
});

const editSchema = z.object({
    id: z.string().describe('Newsletter ID (required)'),
    ...newsletterWriteFields,
    name: z.string().optional().describe('Newsletter name'),
});

export const adminNewsletterActions: ActionDefinition[] = [
    {
        name: 'newsletters.browse',
        api: 'admin',
        method: 'GET',
        path: '/newsletters/',
        inputSchema: browseParams,
        description: 'Browse all newsletters',
        example: { limit: 'all' },
    },
    {
        name: 'newsletters.read',
        api: 'admin',
        method: 'GET',
        path: '/newsletters/{id}/',
        inputSchema: readParams,
        description: 'Read a single newsletter by ID',
    },
    {
        name: 'newsletters.add',
        api: 'admin',
        method: 'POST',
        path: '/newsletters/',
        inputSchema: addSchema,
        description: 'Create a new newsletter',
        example: { name: 'Weekly Digest', sender_name: 'My Blog' },
    },
    {
        name: 'newsletters.edit',
        api: 'admin',
        method: 'PUT',
        path: '/newsletters/{id}/',
        inputSchema: editSchema,
        description: 'Update an existing newsletter',
    },
];
