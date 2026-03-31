import { z } from 'zod';
import type { ActionDefinition } from '../registry.js';

const readParams = z.object({}).describe('No parameters required');

export const contentSettingsActions: ActionDefinition[] = [
    {
        name: 'settings.read',
        api: 'content',
        method: 'GET',
        path: '/settings/',
        inputSchema: readParams,
        description: 'Read site settings (Content API — read-only)',
    },
];
