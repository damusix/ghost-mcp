// Converts a small subset of inline markdown into Lexical inline nodes so prose
// blocks render as native, editable text in Koenig (not raw HTML).
//
// Supported: **bold**, *italic* / _italic_, `code`, [label](url). Anything else
// is preserved as plain text. Lexical text `format` is a bitmask:
// 1=bold, 2=italic, 4=strikethrough, 8=underline, 16=code.

export interface TextNode {
    type: 'extended-text';
    version: 1;
    text: string;
    format: number;
    mode: 'normal';
    style: '';
    detail: 0;
}

export interface LinkNode {
    type: 'link';
    version: 1;
    direction: 'ltr';
    format: '';
    indent: 0;
    rel: null;
    target: null;
    title: null;
    url: string;
    children: TextNode[];
}

export type InlineNode = TextNode | LinkNode;

export const FORMAT = { bold: 1, italic: 2, strikethrough: 4, underline: 8, code: 16 } as const;

function textNode(text: string, format = 0): TextNode {
    return {
        type: 'extended-text',
        version: 1,
        text,
        format,
        mode: 'normal',
        style: '',
        detail: 0,
    };
}

function linkNode(url: string, label: string): LinkNode {
    return {
        type: 'link',
        version: 1,
        direction: 'ltr',
        format: '',
        indent: 0,
        rel: null,
        target: null,
        title: null,
        url,
        children: [textNode(label)],
    };
}

// link | code | bold | italic(*) | italic(_) — ordered so ** is tried before *
const TOKEN =
    /\[([^\]]+)\]\(([^)\s]+)\)|`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*|(?<![\w])_([^_]+)_(?![\w])/g;

export function parseInline(input: string): InlineNode[] {
    const nodes: InlineNode[] = [];
    let last = 0;
    let m: RegExpExecArray | null;
    TOKEN.lastIndex = 0;
    while ((m = TOKEN.exec(input)) !== null) {
        if (m.index > last) {
            nodes.push(textNode(input.slice(last, m.index)));
        }
        if (m[1] !== undefined) {
            nodes.push(linkNode(m[2], m[1]));
        } else if (m[3] !== undefined) {
            nodes.push(textNode(m[3], FORMAT.code));
        } else if (m[4] !== undefined) {
            nodes.push(textNode(m[4], FORMAT.bold));
        } else if (m[5] !== undefined) {
            nodes.push(textNode(m[5], FORMAT.italic));
        } else if (m[6] !== undefined) {
            nodes.push(textNode(m[6], FORMAT.italic));
        }
        last = m.index + m[0].length;
    }
    if (last < input.length) {
        nodes.push(textNode(input.slice(last)));
    }
    // a non-empty input must yield at least one node
    if (nodes.length === 0) {
        nodes.push(textNode(input));
    }
    return nodes;
}
