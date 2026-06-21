// Human/LLM-readable catalog of block types for the koenig help tool. Built from
// the same registry the composer uses, so help can never drift from behavior.
import { CARDS } from './cards.js';

interface ProseHelp {
    type: string;
    description: string;
    example: Record<string, unknown>;
}

const PROSE: ProseHelp[] = [
    {
        type: 'paragraph',
        description:
            'A text paragraph. `text` supports inline **bold**, _italic_, `code`, [links](url).',
        example: { type: 'paragraph', text: 'Some **bold** and a [link](https://x.com).' },
    },
    {
        type: 'heading',
        description: 'A heading. `level` 1–6 (default 2). `text` supports inline markdown.',
        example: { type: 'heading', level: 2, text: 'Section title' },
    },
    {
        type: 'list',
        description:
            'A bullet or numbered list. `style`: "bullet" (default) or "number". `items` is a string array (inline markdown supported).',
        example: { type: 'list', style: 'bullet', items: ['First', 'Second'] },
    },
    {
        type: 'quote',
        description: 'A blockquote. `text` supports inline markdown.',
        example: { type: 'quote', text: 'A memorable quote.' },
    },
    {
        type: 'aside',
        description: 'A pull-quote / aside.',
        example: { type: 'aside', text: 'An aside.' },
    },
];

export function listBlockTypes(): string[] {
    return [...PROSE.map((p) => p.type), ...Object.keys(CARDS)];
}

export function blockHelp(blockType?: string): string {
    if (blockType) {
        const prose = PROSE.find((p) => p.type === blockType);
        if (prose) {
            return [
                `# block: ${prose.type}`,
                '',
                prose.description,
                '',
                '```json',
                JSON.stringify(prose.example, null, 2),
                '```',
            ].join('\n');
        }
        const card = CARDS[blockType];
        if (!card) {
            return `Unknown block type "${blockType}". Run koenig_help with no argument to list all block types.`;
        }
        const example = { type: blockType, ...card.example };
        const lines = [
            `# block: ${blockType}`,
            '',
            `${card.description}`,
            '',
            `- Lexical node: \`${card.nodeType}\` (version ${card.version})`,
            card.required.length
                ? `- Required fields: ${card.required.map((r) => `\`${r}\``).join(', ')}`
                : '- Required fields: none',
        ];
        if (Object.keys(card.aliases).length) {
            lines.push(
                `- Aliases: ${Object.entries(card.aliases)
                    .map(([f, t]) => `\`${f}\`→\`${t}\``)
                    .join(', ')}`,
            );
        }
        lines.push('', '```json', JSON.stringify(example, null, 2), '```');
        return lines.join('\n');
    }

    const lines = [
        '# Koenig block types',
        '',
        'Compose posts from these blocks instead of raw HTML — they produce clean, natively-editable Ghost content.',
        '',
        '## Prose (native, inline markdown in `text`)',
    ];
    for (const p of PROSE) {
        lines.push(`- **${p.type}** — ${p.description}`);
    }

    const byGroup: Record<string, string[]> = {};
    for (const [type, def] of Object.entries(CARDS)) {
        (byGroup[def.group] ??= []).push(`- **${type}** — ${def.description}`);
    }
    for (const [group, entries] of Object.entries(byGroup)) {
        lines.push('', `## ${group}`);
        lines.push(...entries);
    }
    lines.push(
        '',
        'Use `koenig_help` with a `block` name for fields + a JSON example. Then call `compose_post` (creates the post) or `compose_lexical` (returns the lexical string).',
    );
    return lines.join('\n');
}
