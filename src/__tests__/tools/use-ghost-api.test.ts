import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleUseGhostApi } from '../../tools/use-ghost-api.js';
import { adminApi, contentApi } from '../../ghost-client.js';

// Mock ghost-client
vi.mock('../../ghost-client.js', () => ({
    adminApi: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    },
    contentApi: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    },
}));

// Mock @logosdx/utils
vi.mock('@logosdx/utils', () => ({
    attempt: vi.fn(async (fn: () => Promise<unknown>) => {
        try {
            const result = await fn();
            return [result, null];
        } catch (error) {
            return [null, error];
        }
    }),
}));

describe('use-ghost-api handler', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('rejects admin actions in content mode', async () => {
        const result = await handleUseGhostApi({ api: 'admin', action: 'posts.browse' }, 'content');
        const parsed = JSON.parse(result);
        expect(parsed.error).toContain('not available in content mode');
    });

    it('returns error for unknown action', async () => {
        const result = await handleUseGhostApi(
            { api: 'admin', action: 'nonexistent.action' },
            'admin',
        );
        const parsed = JSON.parse(result);
        expect(parsed.error).toContain('Unknown action');
    });

    it('validates payload against Zod schema — rejects invalid', async () => {
        // posts.add requires title
        const result = await handleUseGhostApi(
            { api: 'admin', action: 'posts.add', payload: {} },
            'admin',
        );
        const parsed = JSON.parse(result);
        expect(parsed.error).toBe('Invalid payload');
        expect(parsed.details).toBeDefined();
        expect(parsed.details.length).toBeGreaterThan(0);
    });

    it('builds correct query params for GET requests', async () => {
        vi.mocked(adminApi.get).mockResolvedValue({ data: { posts: [] } } as any);

        await handleUseGhostApi(
            {
                api: 'admin',
                action: 'posts.browse',
                payload: { filter: 'status:published', limit: 10 },
            },
            'admin',
        );

        expect(adminApi.get).toHaveBeenCalledWith(
            '/posts/',
            expect.objectContaining({
                params: expect.objectContaining({
                    filter: 'status:published',
                    limit: '10',
                }),
            }),
        );
    });

    it('substitutes {id} into path for read actions', async () => {
        vi.mocked(adminApi.get).mockResolvedValue({ data: { posts: [] } } as any);

        await handleUseGhostApi(
            {
                api: 'admin',
                action: 'posts.read',
                payload: { id: 'abc123' },
            },
            'admin',
        );

        expect(adminApi.get).toHaveBeenCalledWith('/posts/abc123/', expect.anything());
    });

    it('substitutes {slug} into path', async () => {
        vi.mocked(adminApi.get).mockResolvedValue({ data: { posts: [] } } as any);

        await handleUseGhostApi(
            {
                api: 'admin',
                action: 'posts.read_by_slug',
                payload: { slug: 'my-post' },
            },
            'admin',
        );

        expect(adminApi.get).toHaveBeenCalledWith('/posts/slug/my-post/', expect.anything());
    });

    it('builds correct JSON body for POST requests', async () => {
        vi.mocked(adminApi.post).mockResolvedValue({ data: { posts: [] } } as any);

        await handleUseGhostApi(
            {
                api: 'admin',
                action: 'posts.add',
                payload: { title: 'Test Post', status: 'draft' },
            },
            'admin',
        );

        expect(adminApi.post).toHaveBeenCalledWith('/posts/', {
            posts: [{ title: 'Test Post', status: 'draft' }],
        });
    });

    it('wraps PUT body in resource key', async () => {
        vi.mocked(adminApi.put).mockResolvedValue({ data: { posts: [] } } as any);

        await handleUseGhostApi(
            {
                api: 'admin',
                action: 'posts.edit',
                payload: { id: 'abc123', updated_at: '2024-01-01T00:00:00.000Z', title: 'Updated' },
            },
            'admin',
        );

        expect(adminApi.put).toHaveBeenCalledWith('/posts/abc123/', {
            posts: [
                {
                    updated_at: '2024-01-01T00:00:00.000Z',
                    title: 'Updated',
                },
            ],
        });
    });

    it('uses content API engine for content actions', async () => {
        vi.mocked(contentApi.get).mockResolvedValue({ data: { posts: [] } } as any);

        await handleUseGhostApi({ api: 'content', action: 'posts.browse', payload: {} }, 'admin');

        expect(contentApi.get).toHaveBeenCalled();
        expect(adminApi.get).not.toHaveBeenCalled();
    });

    it('calls delete for DELETE method actions', async () => {
        vi.mocked(adminApi.delete).mockResolvedValue(undefined as any);

        await handleUseGhostApi(
            { api: 'admin', action: 'posts.delete', payload: { id: 'abc123' } },
            'admin',
        );

        expect(adminApi.delete).toHaveBeenCalledWith('/posts/abc123/');
    });
});
