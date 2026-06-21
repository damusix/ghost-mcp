import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleGhostDocs } from '../../tools/ghost-docs.js';
import { docsApi } from '../../ghost-client.js';

const MOCK_DOCS = `# Ghost Documentation
This is the Ghost CMS documentation.
## Posts API
Create and manage posts.
## Members API
Manage your members and subscriptions.
## Webhooks
Listen for events in Ghost.
`;

// Mock ghost-client
vi.mock('../../ghost-client.js', () => ({
    docsApi: {
        get: vi.fn(),
    },
}));

describe('ghost-docs handler', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(docsApi.get).mockResolvedValue({ data: MOCK_DOCS } as any);
    });

    it('returns usage hint when no params provided', async () => {
        const result = await handleGhostDocs({});
        expect(result).toContain('Provide one of');
    });

    it('returns full content with all: true', async () => {
        const result = await handleGhostDocs({ all: true });
        expect(result).toBe(MOCK_DOCS);
        expect(docsApi.get).toHaveBeenCalledWith('/llms.txt');
    });

    it('filters lines case-insensitively with search', async () => {
        const result = await handleGhostDocs({ search: 'posts api' });
        expect(result).toContain('Posts API');
    });

    it('returns no matches message when search finds nothing', async () => {
        const result = await handleGhostDocs({ search: 'xyznonexistent' });
        expect(result).toBe('No matches found.');
    });

    it('applies regex pattern matching', async () => {
        const result = await handleGhostDocs({ regex: '/members/i' });
        expect(result).toContain('Members API');
    });

    it('supports regex without delimiter syntax', async () => {
        const result = await handleGhostDocs({ regex: 'Webhook' });
        expect(result).toContain('Webhooks');
    });

    it('lets a fetch failure propagate (no swallowing)', async () => {
        vi.mocked(docsApi.get).mockRejectedValue(new Error('Network error'));
        await expect(handleGhostDocs({ all: true })).rejects.toThrow('Network error');
    });
});
