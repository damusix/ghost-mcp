// Friendly block -> Lexical decorator (card) node builders. Each entry maps an
// LLM-facing block shape to the exact Koenig node validated in docs/koenig-cards.
// Field aliases keep the block API readable (text/emoji/color) while emitting the
// real lexical field names (calloutText/calloutEmoji/backgroundColor).
import { NODE_SPECS } from './node-specs.js';

export type Fields = Record<string, unknown>;
export type LexicalNode = Record<string, unknown>;

export interface CardDef {
    /** lexical node `type` */
    nodeType: string;
    version: number;
    group: string;
    description: string;
    /** friendly field names that must be present */
    required: string[];
    /** friendly field name -> lexical field name */
    aliases: Record<string, string>;
    /** friendly-shaped example block (without `type`) */
    example: Fields;
    /** custom builder; default applies aliases + passes through known lexical fields */
    build?: (fields: Fields) => LexicalNode;
}

function passthrough(def: CardDef, fields: Fields): LexicalNode {
    const spec = NODE_SPECS[def.nodeType];
    const validFields = spec ? new Set(Object.keys(spec.fields)) : null;
    const node: LexicalNode = {};
    for (const [key, value] of Object.entries(fields)) {
        const target = def.aliases[key] ?? key;
        if (validFields && !validFields.has(target)) {
            const allowed = [...Object.keys(def.aliases), ...(validFields ?? [])].join(', ');
            throw new Error(
                `unknown field "${key}" for card "${def.nodeType}". allowed: ${allowed}`,
            );
        }
        node[target] = value;
    }
    return node;
}

/** keyed by the friendly block `type` the LLM writes */
export const CARDS: Record<string, CardDef> = {
    image: {
        nodeType: 'image',
        version: 1,
        group: 'media',
        description: 'An image with optional caption, alt text, and link.',
        required: ['src'],
        aliases: {},
        example: { src: 'https://example.com/photo.jpg', alt: 'A photo', caption: 'My caption' },
    },
    gallery: {
        nodeType: 'gallery',
        version: 1,
        group: 'media',
        description:
            'A grid of images. Provide `images` as an array of { src, alt?, width?, height? }.',
        required: ['images'],
        aliases: {},
        example: {
            images: [{ src: 'https://example.com/1.jpg' }, { src: 'https://example.com/2.jpg' }],
            caption: 'Trip photos',
        },
        build(fields) {
            const images = Array.isArray(fields.images) ? fields.images : [];
            const built = images.map((img, i) => {
                const o = (img && typeof img === 'object' ? img : {}) as Record<string, unknown>;
                return {
                    fileName: o.fileName ?? `image-${i}.jpg`,
                    row: o.row ?? 0,
                    src: o.src ?? '',
                    width: o.width ?? 0,
                    height: o.height ?? 0,
                    title: o.title ?? '',
                    alt: o.alt ?? '',
                };
            });
            const node: LexicalNode = { images: built };
            if (typeof fields.caption === 'string') node.caption = fields.caption;
            return node;
        },
    },
    video: {
        nodeType: 'video',
        version: 1,
        group: 'media',
        description: 'A video file. Needs `src`; `thumbnailSrc` sets the poster.',
        required: ['src'],
        aliases: { thumbnail: 'thumbnailSrc' },
        example: {
            src: 'https://example.com/clip.mp4',
            caption: 'A clip',
            thumbnail: 'https://example.com/poster.jpg',
        },
    },
    audio: {
        nodeType: 'audio',
        version: 1,
        group: 'media',
        description: 'An audio file with a title.',
        required: ['src'],
        aliases: { thumbnail: 'thumbnailSrc' },
        example: { src: 'https://example.com/track.mp3', title: 'Episode 1', duration: 320 },
    },
    file: {
        nodeType: 'file',
        version: 1,
        group: 'media',
        description: 'A downloadable file card.',
        required: ['src'],
        aliases: { title: 'fileTitle', name: 'fileName', caption: 'fileCaption', size: 'fileSize' },
        example: {
            src: 'https://example.com/guide.pdf',
            title: 'Whitepaper',
            caption: 'Download our guide',
        },
    },
    bookmark: {
        nodeType: 'bookmark',
        version: 1,
        group: 'embed',
        description:
            'A rich link preview. Provide `url`; optionally title/description/author/publisher/icon/thumbnail.',
        required: ['url'],
        aliases: {},
        example: { url: 'https://ghost.org', title: 'Ghost', description: 'Publishing platform' },
        build(fields) {
            const metaKeys = [
                'title',
                'description',
                'author',
                'publisher',
                'icon',
                'thumbnail',
            ] as const;
            const metadata: Record<string, unknown> = { url: fields.url };
            for (const k of metaKeys) metadata[k] = fields[k] ?? (k === 'author' ? null : '');
            const node: LexicalNode = { url: fields.url, caption: fields.caption ?? '', metadata };
            return node;
        },
    },
    embed: {
        nodeType: 'embed',
        version: 1,
        group: 'embed',
        description:
            'An external embed (YouTube, Twitter, etc.). Provide `url` and the embed `html`.',
        required: ['url'],
        aliases: {},
        example: {
            url: 'https://youtube.com/watch?v=abc',
            embedType: 'video',
            html: '<iframe src="..."></iframe>',
        },
    },
    html: {
        nodeType: 'html',
        version: 1,
        group: 'embed',
        description: 'Raw HTML passthrough. Use only when no native card fits.',
        required: ['html'],
        aliases: {},
        example: { html: '<div class="custom">Raw HTML</div>' },
    },
    markdown: {
        nodeType: 'markdown',
        version: 1,
        group: 'embed',
        description:
            'A markdown block (rendered as one unit). Prefer paragraph/heading/list blocks for editable prose.',
        required: ['markdown'],
        aliases: { text: 'markdown' },
        example: { markdown: '## Heading\n\nSome **markdown**.' },
    },
    codeblock: {
        nodeType: 'codeblock',
        version: 1,
        group: 'embed',
        description: 'A syntax-highlighted code block.',
        required: ['code'],
        aliases: { lang: 'language' },
        example: { code: 'const x = 1;', language: 'javascript', caption: 'snippet' },
    },
    callout: {
        nodeType: 'callout',
        version: 1,
        group: 'layout',
        description: 'A highlighted callout box with an emoji and background color.',
        required: ['text'],
        aliases: { text: 'calloutText', emoji: 'calloutEmoji', color: 'backgroundColor' },
        example: { text: 'Heads up!', emoji: '💡', color: 'blue' },
    },
    toggle: {
        nodeType: 'toggle',
        version: 1,
        group: 'layout',
        description: 'A collapsible accordion. `content` is HTML. (No-op in email.)',
        required: ['heading'],
        aliases: {},
        example: { heading: 'Click to expand', content: '<p>Hidden content.</p>' },
    },
    button: {
        nodeType: 'button',
        version: 1,
        group: 'layout',
        description: 'A call-to-action button.',
        required: ['text', 'url'],
        aliases: { text: 'buttonText', url: 'buttonUrl' },
        example: { text: 'Subscribe', url: 'https://example.com', alignment: 'center' },
    },
    header: {
        nodeType: 'header',
        version: 2,
        group: 'layout',
        description: 'A large hero header with optional background image and button.',
        required: [],
        aliases: { title: 'header' },
        example: {
            header: 'Big Header',
            subheader: 'A subheader',
            buttonEnabled: true,
            buttonText: 'Start',
            buttonUrl: 'https://example.com',
        },
    },
    cta: {
        nodeType: 'call-to-action',
        version: 1,
        group: 'layout',
        description:
            'A call-to-action card with text, optional image and button. `text` accepts HTML or plain text.',
        required: [],
        aliases: { buttonColor: 'buttonColor' },
        example: {
            text: 'Subscribe for more.',
            buttonText: 'Join',
            buttonUrl: 'https://example.com',
            showButton: true,
        },
        build(fields) {
            const node: LexicalNode = {};
            const passKeys = [
                'layout',
                'alignment',
                'showButton',
                'showDividers',
                'buttonText',
                'buttonUrl',
                'buttonColor',
                'buttonTextColor',
                'hasSponsorLabel',
                'sponsorLabel',
                'backgroundColor',
                'linkColor',
                'imageUrl',
                'imageWidth',
                'imageHeight',
                'visibility',
            ] as const;
            for (const k of passKeys) if (k in fields) node[k] = fields[k];
            if (typeof fields.text === 'string') {
                node.textValue = /^\s*</.test(fields.text) ? fields.text : `<p>${fields.text}</p>`;
            }
            return node;
        },
    },
    signup: {
        nodeType: 'signup',
        version: 1,
        group: 'membership',
        description: 'A member signup form. (No-op in email.)',
        required: [],
        aliases: {},
        example: { header: 'Subscribe', subheader: 'Join the newsletter', disclaimer: 'No spam.' },
    },
    product: {
        nodeType: 'product',
        version: 1,
        group: 'layout',
        description: 'A product card with image, rating, and button.',
        required: ['productTitle'],
        aliases: {
            title: 'productTitle',
            description: 'productDescription',
            image: 'productImageSrc',
            button: 'productButton',
            url: 'productUrl',
            rating: 'productStarRating',
        },
        example: {
            title: 'The Product',
            description: 'A great product.',
            rating: 5,
            button: 'Buy',
            url: 'https://example.com',
            productButtonEnabled: true,
            productRatingEnabled: true,
        },
    },
    divider: {
        nodeType: 'horizontalrule',
        version: 1,
        group: 'divider',
        description: 'A horizontal rule / divider.',
        required: [],
        aliases: {},
        example: {},
        build() {
            return {};
        },
    },
    paywall: {
        nodeType: 'paywall',
        version: 1,
        group: 'membership',
        description: 'Splits free vs members-only content. Everything after it is members-only.',
        required: [],
        aliases: {},
        example: {},
        build() {
            return {};
        },
    },
    email: {
        nodeType: 'email',
        version: 1,
        group: 'email-only',
        description:
            'Content shown ONLY in the email newsletter (empty on web). `html` supports {first_name, "fallback"}.',
        required: ['html'],
        aliases: {},
        example: { html: '<p>Hello {first_name, "there"}!</p>' },
    },
    'email-cta': {
        nodeType: 'email-cta',
        version: 1,
        group: 'email-only',
        description: 'A newsletter-only call to action targeting a member segment.',
        required: [],
        aliases: {},
        example: {
            html: '<p>Read more.</p>',
            buttonText: 'Read',
            buttonUrl: 'https://example.com',
            segment: 'status:free',
        },
    },
};

export function buildCardNode(blockType: string, fields: Fields): LexicalNode {
    const def = CARDS[blockType];
    if (!def) throw new Error(`unknown card type "${blockType}"`);
    for (const r of def.required) {
        if (fields[r] === undefined || fields[r] === null || fields[r] === '') {
            throw new Error(`card "${blockType}" requires field "${r}"`);
        }
    }
    const data = def.build ? def.build(fields) : passthrough(def, fields);
    return { type: def.nodeType, version: def.version, ...data };
}

export function isCardType(blockType: string): boolean {
    return blockType in CARDS;
}
