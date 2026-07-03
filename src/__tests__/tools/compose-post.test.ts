import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleComposePost } from '../../tools/compose-post.js';
import { adminApi } from '../../ghost-client.js';

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

vi.mock('@logosdx/utils', () => ({
    attempt: vi.fn(async (fn: () => Promise<unknown>) => {
        try {
            return [await fn(), null];
        } catch (error) {
            return [null, error];
        }
    }),
}));

describe('compose_post handler', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('creates a post with composed lexical, not raw html', async () => {
        vi.mocked(adminApi.post).mockResolvedValue({ data: { posts: [{ id: 'abc' }] } });

        await handleComposePost(
            {
                title: 'My Post',
                status: 'draft',
                blocks: [
                    { type: 'heading', level: 2, text: 'Hello' },
                    { type: 'paragraph', text: 'Body with **bold**.' },
                    { type: 'callout', text: 'Note', emoji: '💡', color: 'blue' },
                ],
            },
            'admin',
        );

        expect(adminApi.post).toHaveBeenCalledTimes(1);
        const [path, body] = vi.mocked(adminApi.post).mock.calls[0];
        expect(path).toBe('/posts/');
        const post = (body as { posts: Record<string, unknown>[] }).posts[0];
        expect(post.title).toBe('My Post');
        expect(typeof post.lexical).toBe('string');

        const lexical = JSON.parse(post.lexical as string);
        const types = lexical.root.children.map((c: { type: string }) => c.type);
        expect(types).toEqual(['extended-heading', 'paragraph', 'callout']);
        // no raw html field smuggled in
        expect(post.html).toBeUndefined();
    });

    it('updates an existing post when id is provided (PUT)', async () => {
        vi.mocked(adminApi.put).mockResolvedValue({ data: { posts: [{ id: 'abc' }] } });

        await handleComposePost(
            {
                id: 'abc',
                updated_at: '2024-01-01T00:00:00.000Z',
                blocks: [{ type: 'paragraph', text: 'hi' }],
            },
            'admin',
        );

        expect(adminApi.put).toHaveBeenCalledTimes(1);
        const [path] = vi.mocked(adminApi.put).mock.calls[0];
        expect(path).toBe('/posts/abc/');
    });

    it('returns composition issues without calling the API for bad blocks', async () => {
        const result = await handleComposePost(
            { title: 'X', blocks: [{ type: 'button', text: 'no url' }] },
            'admin',
        );

        expect(adminApi.post).not.toHaveBeenCalled();
        const parsed = JSON.parse(result);
        expect(parsed.error).toBe('composition failed');
        expect(parsed.issues[0]).toMatchObject({ index: 0, type: 'button' });
    });

    it('maps excerpt to custom_excerpt', async () => {
        vi.mocked(adminApi.post).mockResolvedValue({ data: { posts: [{ id: 'abc' }] } });

        await handleComposePost(
            { title: 'X', excerpt: 'A summary', blocks: [{ type: 'paragraph', text: 'hi' }] },
            'admin',
        );

        const [, body] = vi.mocked(adminApi.post).mock.calls[0];
        const post = (body as { posts: Record<string, unknown>[] }).posts[0];
        expect(post.custom_excerpt).toBe('A summary');
        expect(post.excerpt).toBeUndefined();
    });
});
