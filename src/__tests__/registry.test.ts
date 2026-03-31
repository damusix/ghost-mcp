import { describe, it, expect } from 'vitest';
import { getAction, listActions, getActionHelp } from '../actions/registry.js';

describe('Action Registry', () => {
    describe('listActions', () => {
        it('returns all registered actions', () => {
            const all = listActions();
            expect(all.length).toBeGreaterThan(0);
        });

        it('filters by admin API', () => {
            const admin = listActions('admin');
            expect(admin.length).toBeGreaterThan(0);
            expect(admin.every((a) => a.api === 'admin')).toBe(true);
        });

        it('filters by content API', () => {
            const content = listActions('content');
            expect(content.length).toBeGreaterThan(0);
            expect(content.every((a) => a.api === 'content')).toBe(true);
        });

        it('returns both admin and content actions when unfiltered', () => {
            const all = listActions();
            const apis = new Set(all.map((a) => a.api));
            expect(apis.has('admin')).toBe(true);
            expect(apis.has('content')).toBe(true);
        });
    });

    describe('getAction', () => {
        it('returns correct action for posts.browse', () => {
            const action = getAction('posts.browse', 'admin');
            expect(action).toBeDefined();
            expect(action!.name).toBe('posts.browse');
            expect(action!.api).toBe('admin');
            expect(action!.method).toBe('GET');
            expect(action!.path).toBe('/posts/');
        });

        it('returns undefined for nonexistent action', () => {
            const action = getAction('nonexistent.action');
            expect(action).toBeUndefined();
        });

        it('prefers admin when no API specified', () => {
            const action = getAction('posts.browse');
            expect(action).toBeDefined();
            expect(action!.api).toBe('admin');
        });

        it('returns content action when specified', () => {
            const action = getAction('posts.browse', 'content');
            expect(action).toBeDefined();
            expect(action!.api).toBe('content');
        });
    });

    describe('getActionHelp', () => {
        it('returns schema description for posts.add', () => {
            const help = getActionHelp('posts.add');
            expect(help).toBeDefined();
            expect(help).toContain('posts.add');
            expect(help).toContain('title');
            expect(help).toContain('required');
            expect(help).toContain('POST');
        });

        it('returns undefined for unknown action', () => {
            const help = getActionHelp('nonexistent.action');
            expect(help).toBeUndefined();
        });

        it('includes example payload when available', () => {
            const help = getActionHelp('posts.browse');
            expect(help).toBeDefined();
            expect(help).toContain('Example Payload');
        });

        it('lists all fields for posts.edit', () => {
            const help = getActionHelp('posts.edit', 'admin');
            expect(help).toBeDefined();
            expect(help).toContain('id');
            expect(help).toContain('updated_at');
            expect(help).toContain('required');
        });
    });
});
