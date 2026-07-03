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
        invalidatePath: vi.fn(),
    },
    contentApi: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
        invalidatePath: vi.fn(),
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

    it('surfaces the Ghost error body (message + context + status), not just the HTTP status text', async () => {
        const ghostError = Object.assign(new Error('Unprocessable Entity'), {
            status: 422,
            data: {
                errors: [
                    {
                        message: 'Validation error, cannot save post.',
                        context: 'Invalid lexical structure.',
                        type: 'ValidationError',
                        property: 'lexical',
                    },
                ],
            },
        });
        vi.mocked(adminApi.post).mockRejectedValue(ghostError);

        const result = await handleUseGhostApi(
            { api: 'admin', action: 'posts.add', payload: { title: 'X', lexical: '{bad}' } },
            'admin',
        );
        const parsed = JSON.parse(result);
        expect(parsed.status).toBe(422);
        expect(parsed.errors[0].context).toBe('Invalid lexical structure.');
        expect(parsed.errors[0].property).toBe('lexical');
        // not the old opaque shape
        expect(parsed.error).toBeUndefined();
    });

    it('accepts tags as plain name strings (not only objects)', async () => {
        vi.mocked(adminApi.post).mockResolvedValue({ data: { posts: [{ id: '1' }] } } as never);

        const result = await handleUseGhostApi(
            { api: 'admin', action: 'posts.add', payload: { title: 'X', tags: ['News'] } },
            'admin',
        );
        const parsed = JSON.parse(result);
        expect(parsed.error).toBeUndefined();
        expect(parsed.posts[0].id).toBe('1');
        const [, body] = vi.mocked(adminApi.post).mock.calls[0];
        expect((body as { posts: Record<string, unknown>[] }).posts[0].tags).toEqual(['News']);
    });

    it('returns the Ghost body — pagination meta stays visible, transport wrapper and auth header do not leak', async () => {
        vi.mocked(adminApi.get).mockResolvedValue({
            data: {
                tags: [{ id: 't1', name: 'News' }],
                meta: { pagination: { page: 2, limit: 2, pages: 3, total: 6, next: 3, prev: 1 } },
            },
            status: 200,
            headers: { 'content-type': 'application/json' },
            config: { headers: { Authorization: 'Ghost secret-jwt' } },
        } as never);

        const result = await handleUseGhostApi(
            { api: 'admin', action: 'tags.browse', payload: { limit: 2, page: 2 } },
            'admin',
        );
        const parsed = JSON.parse(result);
        expect(parsed.tags).toEqual([{ id: 't1', name: 'News' }]);
        expect(parsed.meta.pagination.page).toBe(2);
        expect(parsed.meta.pagination.next).toBe(3);
        // the FetchEngine wrapper (headers, config, JWT) must never reach the client
        expect(result).not.toContain('Authorization');
        expect(parsed.config).toBeUndefined();
        expect(parsed.headers).toBeUndefined();
    });

    it('falls back to a success marker when DELETE returns no body', async () => {
        vi.mocked(adminApi.delete).mockResolvedValue(undefined as never);

        const result = await handleUseGhostApi(
            { api: 'admin', action: 'posts.delete', payload: { id: 'abc123' } },
            'admin',
        );
        expect(JSON.parse(result)).toEqual({ success: true });
    });

    it('surfaces the Ghost error body on upload failures too', async () => {
        const ghostError = Object.assign(new Error('Unsupported Media Type'), {
            status: 415,
            data: {
                errors: [
                    { message: 'Please select a valid image.', type: 'UnsupportedMediaTypeError' },
                ],
            },
        });
        vi.mocked(adminApi.post).mockRejectedValue(ghostError);

        const result = await handleUseGhostApi(
            {
                api: 'admin',
                action: 'images.upload',
                payload: { file: Buffer.from('not-an-image').toString('base64') },
            },
            'admin',
        );
        const parsed = JSON.parse(result);
        expect(parsed.status).toBe(415);
        expect(parsed.errors[0].message).toBe('Please select a valid image.');
    });
});
