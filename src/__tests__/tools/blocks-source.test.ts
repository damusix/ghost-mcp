import { describe, it, expect, afterAll } from 'vitest';
import { writeFileSync, rmSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { resolveBlocks } from '../../tools/blocks-source.js';

const dir = mkdtempSync(join(tmpdir(), 'koenig-blocks-'));

function writeJson(name: string, content: string): string {
    const path = join(dir, name);
    writeFileSync(path, content);
    return path;
}

afterAll(() => {
    rmSync(dir, { recursive: true, force: true });
});

describe('resolveBlocks', () => {
    it('returns inline blocks unchanged', () => {
        const blocks = [{ type: 'paragraph', text: 'hi' }];
        expect(resolveBlocks({ blocks })).toBe(blocks);
    });

    it('reads a bare JSON array from an absolute file path', () => {
        const path = writeJson(
            'a.json',
            JSON.stringify([{ type: 'paragraph', text: 'from file' }]),
        );
        const blocks = resolveBlocks({ blockFile: path });
        expect(blocks).toEqual([{ type: 'paragraph', text: 'from file' }]);
    });

    it('reads a { blocks: [...] } wrapper object', () => {
        const path = writeJson('b.json', JSON.stringify({ blocks: [{ type: 'divider' }] }));
        expect(resolveBlocks({ blockFile: path })).toEqual([{ type: 'divider' }]);
    });

    it('rejects when both blocks and blockFile are given', () => {
        const path = writeJson('c.json', '[]');
        expect(() => resolveBlocks({ blocks: [], blockFile: path })).toThrow(/not both/);
    });

    it('rejects when neither is given', () => {
        expect(() => resolveBlocks({})).toThrow(/provide "blocks".*or "blockFile"/);
    });

    it('rejects a relative blockFile path', () => {
        expect(() => resolveBlocks({ blockFile: './blocks.json' })).toThrow(/absolute path/);
    });

    it('reports a missing file clearly', () => {
        expect(() => resolveBlocks({ blockFile: join(dir, 'missing.json') })).toThrow(
            /could not read/,
        );
    });

    it('reports invalid JSON clearly', () => {
        const path = writeJson('bad.json', '{ not json');
        expect(() => resolveBlocks({ blockFile: path })).toThrow(/not valid JSON/);
    });

    it('rejects JSON that is not an array or { blocks }', () => {
        const path = writeJson('wrong.json', JSON.stringify({ foo: 1 }));
        expect(() => resolveBlocks({ blockFile: path })).toThrow(/must contain a JSON array/);
    });
});
