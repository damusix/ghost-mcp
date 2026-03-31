import { describe, it, expect } from 'vitest';
import { getAction, listActions } from '../../actions/registry.js';

describe('Content Post Action Schemas', () => {
    it('content posts are read-only (GET method only)', () => {
        const contentActions = listActions('content').filter((a) => a.name.startsWith('posts.'));
        expect(contentActions.length).toBeGreaterThan(0);
        expect(contentActions.every((a) => a.method === 'GET')).toBe(true);
    });

    it('content API has no write actions for posts', () => {
        const writeActions = ['posts.add', 'posts.edit', 'posts.delete', 'posts.copy'];
        for (const name of writeActions) {
            const action = getAction(name, 'content');
            expect(action).toBeUndefined();
        }
    });

    describe('posts.browse (content)', () => {
        const action = getAction('posts.browse', 'content')!;

        it('is registered', () => {
            expect(action).toBeDefined();
            expect(action.api).toBe('content');
            expect(action.method).toBe('GET');
        });

        it('accepts read params', () => {
            const result = action.inputSchema.safeParse({
                include: 'authors,tags',
                filter: 'tag:news',
                limit: 10,
                page: 1,
            });
            expect(result.success).toBe(true);
        });

        it('accepts empty payload', () => {
            const result = action.inputSchema.safeParse({});
            expect(result.success).toBe(true);
        });
    });

    describe('posts.read (content)', () => {
        const action = getAction('posts.read', 'content')!;

        it('requires id', () => {
            const fail = action.inputSchema.safeParse({});
            expect(fail.success).toBe(false);

            const pass = action.inputSchema.safeParse({ id: 'abc123' });
            expect(pass.success).toBe(true);
        });
    });

    describe('posts.read_by_slug (content)', () => {
        const action = getAction('posts.read_by_slug', 'content')!;

        it('requires slug', () => {
            const fail = action.inputSchema.safeParse({});
            expect(fail.success).toBe(false);

            const pass = action.inputSchema.safeParse({ slug: 'my-post' });
            expect(pass.success).toBe(true);
        });
    });
});
