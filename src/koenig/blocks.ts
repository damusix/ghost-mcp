// Turns a friendly block into a Lexical node. Prose blocks (paragraph, heading,
// list, quote, aside) become native element nodes with inline-markdown children
// so they stay editable in Koenig; everything else dispatches to a card builder.
import { parseInline, type InlineNode } from './inline.js';
import { buildCardNode, isCardType, CARDS, type LexicalNode } from './cards.js';
import { isRecord } from './util.js';

export interface Block {
    type: string;
    [key: string]: unknown;
}

const ELEMENT = { direction: 'ltr', format: '', indent: 0 } as const;

function element(type: string, extra: LexicalNode, children: unknown[]): LexicalNode {
    return { type, version: 1, ...ELEMENT, ...extra, children };
}

function asString(value: unknown, field: string, blockType: string): string {
    if (typeof value !== 'string') {
        throw new Error(`block "${blockType}" field "${field}" must be a string`);
    }
    return value;
}

function buildProse(block: Block): LexicalNode | null {
    switch (block.type) {
        case 'paragraph':
            return element('paragraph', {}, parseInline(asString(block.text, 'text', 'paragraph')));
        case 'heading': {
            const level =
                typeof block.level === 'number' ? Math.min(6, Math.max(1, block.level)) : 2;
            return element(
                'extended-heading',
                { tag: `h${level}` },
                parseInline(asString(block.text, 'text', 'heading')),
            );
        }
        case 'quote':
            return element(
                'extended-quote',
                {},
                parseInline(asString(block.text, 'text', 'quote')),
            );
        case 'aside':
            return element('aside', {}, parseInline(asString(block.text, 'text', 'aside')));
        case 'list': {
            const items = Array.isArray(block.items) ? block.items : [];
            if (items.length === 0)
                throw new Error('block "list" requires a non-empty "items" array');
            const ordered = block.style === 'number' || block.style === 'ordered';
            const children = items.map(
                (item, i): LexicalNode =>
                    element('listitem', { value: i + 1 }, parseInline(String(item))),
            );
            return element(
                'list',
                {
                    listType: ordered ? 'number' : 'bullet',
                    tag: ordered ? 'ol' : 'ul',
                    start: 1,
                },
                children,
            );
        }
        default:
            return null;
    }
}

function isBlock(value: unknown): value is Block {
    return isRecord(value) && typeof value.type === 'string';
}

export function buildBlock(block: unknown): LexicalNode {
    if (!isBlock(block)) {
        throw new Error('each block must be an object with a string "type"');
    }
    const prose = buildProse(block);
    if (prose) return prose;
    if (isCardType(block.type)) {
        const { type, ...fields } = block;
        return buildCardNode(type, fields);
    }
    throw new Error(
        `unknown block type "${block.type}". valid types: ${[...PROSE_TYPES, ...Object.keys(CARDS)].join(', ')}`,
    );
}

export const PROSE_TYPES = ['paragraph', 'heading', 'list', 'quote', 'aside'] as const;

export type { InlineNode };
