import { describe, it, expect } from 'vitest';
import { compose, composeRoot, ComposeError } from '../../koenig/compose.js';
import type { ComposeIssue } from '../../koenig/compose.js';

function nodes(blocks: Parameters<typeof composeRoot>[0]) {
    const root = composeRoot(blocks) as { root: { children: Record<string, unknown>[] } };
    return root.root.children;
}

describe('compose', () => {
    it('wraps blocks in a valid lexical root envelope', () => {
        const out = JSON.parse(compose([{ type: 'paragraph', text: 'hi' }]));
        expect(out.root).toMatchObject({ type: 'root', version: 1, direction: 'ltr' });
        expect(out.root.children).toHaveLength(1);
    });

    it('builds a paragraph as a native element with inline children', () => {
        const [p] = nodes([{ type: 'paragraph', text: 'a **b**' }]);
        expect(p).toMatchObject({ type: 'paragraph', version: 1 });
        expect(p.children).toHaveLength(2);
    });

    it('builds a heading with the requested level', () => {
        const [h] = nodes([{ type: 'heading', level: 3, text: 'Title' }]);
        expect(h).toMatchObject({ type: 'extended-heading', tag: 'h3' });
    });

    it('builds a bullet list with listitem children', () => {
        const [list] = nodes([{ type: 'list', style: 'bullet', items: ['one', 'two'] }]);
        expect(list).toMatchObject({ type: 'list', listType: 'bullet', tag: 'ul' });
        expect((list.children as unknown[]).length).toBe(2);
        expect((list.children as Record<string, unknown>[])[0]).toMatchObject({
            type: 'listitem',
            value: 1,
        });
    });

    it('maps callout aliases to lexical field names', () => {
        const [c] = nodes([{ type: 'callout', text: 'Tip', emoji: '💡', color: 'blue' }]);
        expect(c).toMatchObject({
            type: 'callout',
            calloutText: 'Tip',
            calloutEmoji: '💡',
            backgroundColor: 'blue',
        });
    });

    it('maps button aliases', () => {
        const [b] = nodes([{ type: 'button', text: 'Go', url: 'https://x.com' }]);
        expect(b).toMatchObject({ type: 'button', buttonText: 'Go', buttonUrl: 'https://x.com' });
    });

    it('nests bookmark fields under metadata', () => {
        const [bm] = nodes([{ type: 'bookmark', url: 'https://ghost.org', title: 'Ghost' }]);
        expect(bm).toMatchObject({ type: 'bookmark', url: 'https://ghost.org' });
        expect((bm.metadata as Record<string, unknown>).title).toBe('Ghost');
    });

    it('wraps plain cta text in a paragraph for textValue', () => {
        const [cta] = nodes([{ type: 'cta', text: 'Subscribe' }]);
        expect(cta).toMatchObject({ type: 'call-to-action', textValue: '<p>Subscribe</p>' });
    });

    it('emits a bare node for divider', () => {
        const [d] = nodes([{ type: 'divider' }]);
        expect(d).toEqual({ type: 'horizontalrule', version: 1 });
    });

    it('aggregates errors with block index and type', () => {
        let issues: ComposeIssue[] = [];
        try {
            compose([
                { type: 'paragraph', text: 'ok' },
                { type: 'button', text: 'no url' },
                { type: 'nope' },
            ]);
        } catch (error) {
            if (error instanceof ComposeError) {
                issues = error.issues;
            }
        }
        expect(issues).toHaveLength(2);
        expect(issues[0]).toMatchObject({ index: 1, type: 'button' });
        expect(issues[1]).toMatchObject({ index: 2, type: 'nope' });
    });

    it('rejects an empty block list', () => {
        expect(() => compose([])).toThrow(ComposeError);
    });

    it('rejects unknown fields on a card', () => {
        expect(() => compose([{ type: 'callout', text: 'x', bogus: 1 }])).toThrow(
            /unknown field "bogus"/,
        );
    });
});
