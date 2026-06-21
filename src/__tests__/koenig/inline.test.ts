import { describe, it, expect } from 'vitest';
import { parseInline, FORMAT } from '../../koenig/inline.js';

describe('parseInline', () => {
    it('returns a single plain text node for plain text', () => {
        const nodes = parseInline('hello world');
        expect(nodes).toHaveLength(1);
        expect(nodes[0]).toMatchObject({ type: 'extended-text', text: 'hello world', format: 0 });
    });

    it('marks bold with the bold bitmask', () => {
        const nodes = parseInline('a **bold** b');
        expect(nodes.map((n) => 'text' in n && n.text)).toEqual(['a ', 'bold', ' b']);
        expect(nodes[1]).toMatchObject({ format: FORMAT.bold });
    });

    it('marks italic with * and _', () => {
        expect(parseInline('*x*')[0]).toMatchObject({ text: 'x', format: FORMAT.italic });
        expect(parseInline('_y_')[0]).toMatchObject({ text: 'y', format: FORMAT.italic });
    });

    it('does not treat underscores inside words as italic', () => {
        const nodes = parseInline('call snake_case_name here');
        expect(nodes).toHaveLength(1);
        expect(nodes[0]).toMatchObject({ text: 'call snake_case_name here', format: 0 });
    });

    it('marks inline code', () => {
        expect(parseInline('use `npm i`')[1]).toMatchObject({ text: 'npm i', format: FORMAT.code });
    });

    it('builds a link node with a text child', () => {
        const nodes = parseInline('see [Ghost](https://ghost.org) now');
        expect(nodes[1]).toMatchObject({
            type: 'link',
            url: 'https://ghost.org',
            children: [{ type: 'extended-text', text: 'Ghost' }],
        });
        expect(nodes[0]).toMatchObject({ text: 'see ' });
        expect(nodes[2]).toMatchObject({ text: ' now' });
    });

    it('handles multiple mixed spans in order', () => {
        const nodes = parseInline('**b** and `c` and [l](https://x.com)');
        expect(nodes.map((n) => n.type)).toEqual([
            'extended-text',
            'extended-text',
            'extended-text',
            'extended-text',
            'link',
        ]);
    });

    it('never returns an empty array for non-empty input', () => {
        expect(parseInline('***').length).toBeGreaterThan(0);
    });
});
