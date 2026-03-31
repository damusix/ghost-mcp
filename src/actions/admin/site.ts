import { z } from 'zod';
import type { ActionDefinition } from '../registry.js';

const readParams = z.object({}).describe('No parameters required');

export const adminSiteActions: ActionDefinition[] = [
    {
        name: 'site.read',
        api: 'admin',
        method: 'GET',
        path: '/site/',
        inputSchema: readParams,
        description: 'Read site configuration and metadata',
    },
];
