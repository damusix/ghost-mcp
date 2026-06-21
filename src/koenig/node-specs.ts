// AUTO-GENERATED from docs/koenig-node-specs.json by scripts/koenig/extract-specs.mjs.
// Field/default/visibility schema for Koenig decorator (card) nodes. Do not edit by hand.

export interface KoenigNodeSpec {
    nodeType: string;
    hasVisibility: boolean;
    fields: Record<string, string | number | boolean | null>;
}

export const NODE_SPECS: Record<string, KoenigNodeSpec> = {
    audio: {
        nodeType: 'audio',
        hasVisibility: false,
        fields: {
            duration: 0,
            mimeType: '',
            src: '',
            title: '',
            thumbnailSrc: '',
        },
    },
    bookmark: {
        nodeType: 'bookmark',
        hasVisibility: false,
        fields: {
            title: '',
            description: '',
            url: '',
            caption: '',
            author: '',
            publisher: '',
        },
    },
    button: {
        nodeType: 'button',
        hasVisibility: false,
        fields: {
            buttonText: '',
            alignment: 'center',
            buttonUrl: '',
        },
    },
    'call-to-action': {
        nodeType: 'call-to-action',
        hasVisibility: true,
        fields: {
            layout: 'minimal',
            alignment: 'left',
            textValue: '',
            showButton: true,
            showDividers: true,
            buttonText: 'Learn more',
            buttonUrl: '',
            buttonColor: '#000000',
            buttonTextColor: '#ffffff',
            hasSponsorLabel: true,
            sponsorLabel: '<p><span style="white-space: pre-wrap;">SPONSORED</span></p>',
            backgroundColor: 'grey',
            linkColor: 'text',
            imageUrl: '',
            imageWidth: null,
            imageHeight: null,
        },
    },
    callout: {
        nodeType: 'callout',
        hasVisibility: false,
        fields: {
            calloutText: '',
            calloutEmoji: '💡',
            backgroundColor: 'blue',
        },
    },
    codeblock: {
        nodeType: 'codeblock',
        hasVisibility: false,
        fields: {
            code: '',
            language: '',
            caption: '',
        },
    },
    email: {
        nodeType: 'email',
        hasVisibility: false,
        fields: {
            html: '',
        },
    },
    'email-cta': {
        nodeType: 'email-cta',
        hasVisibility: false,
        fields: {
            alignment: 'left',
            buttonText: '',
            buttonUrl: '',
            html: '',
            segment: 'status:free',
            showButton: false,
            showDividers: true,
        },
    },
    embed: {
        nodeType: 'embed',
        hasVisibility: false,
        fields: {
            url: '',
            embedType: '',
            html: '',
            caption: '',
        },
    },
    file: {
        nodeType: 'file',
        hasVisibility: false,
        fields: {
            src: '',
            fileTitle: '',
            fileCaption: '',
            fileName: '',
            fileSize: 0,
        },
    },
    gallery: {
        nodeType: 'gallery',
        hasVisibility: false,
        fields: {
            images: '[]',
            caption: '',
        },
    },
    header: {
        nodeType: 'header',
        hasVisibility: false,
        fields: {
            size: 'small',
            style: 'dark',
            buttonEnabled: false,
            buttonUrl: '',
            buttonText: '',
            header: '',
            subheader: '',
            backgroundImageSrc: '',
            version: 1,
            accentColor: '#FF1A75',
            alignment: 'center',
            backgroundColor: '#000000',
            backgroundImageWidth: null,
            backgroundImageHeight: null,
            backgroundSize: 'cover',
            textColor: '#FFFFFF',
            buttonColor: '#ffffff',
            buttonTextColor: '#000000',
            layout: 'full',
            swapped: false,
        },
    },
    html: {
        nodeType: 'html',
        hasVisibility: true,
        fields: {
            html: '',
        },
    },
    image: {
        nodeType: 'image',
        hasVisibility: false,
        fields: {
            src: '',
            caption: '',
            title: '',
            alt: '',
            cardWidth: 'regular',
            width: null,
            height: null,
            href: '',
        },
    },
    markdown: {
        nodeType: 'markdown',
        hasVisibility: false,
        fields: {
            markdown: '',
        },
    },
    product: {
        nodeType: 'product',
        hasVisibility: false,
        fields: {
            productImageSrc: '',
            productImageWidth: null,
            productImageHeight: null,
            productTitle: '',
            productDescription: '',
            productRatingEnabled: false,
            productStarRating: 5,
            productButtonEnabled: false,
            productButton: '',
            productUrl: '',
        },
    },
    signup: {
        nodeType: 'signup',
        hasVisibility: false,
        fields: {
            alignment: 'left',
            backgroundColor: '#F0F0F0',
            backgroundImageSrc: '',
            backgroundSize: 'cover',
            textColor: '',
            buttonColor: 'accent',
            buttonTextColor: '#FFFFFF',
            buttonText: 'Subscribe',
            disclaimer: '',
            header: '',
            layout: 'wide',
            subheader: '',
            successMessage: 'Email sent! Check your inbox to complete your signup.',
            swapped: false,
        },
    },
    toggle: {
        nodeType: 'toggle',
        hasVisibility: false,
        fields: {
            heading: '',
            content: '',
        },
    },
    transistor: {
        nodeType: 'transistor',
        hasVisibility: true,
        fields: {
            accentColor: '',
            backgroundColor: '',
        },
    },
    video: {
        nodeType: 'video',
        hasVisibility: false,
        fields: {
            src: '',
            caption: '',
            fileName: '',
            mimeType: '',
            width: null,
            height: null,
            duration: 0,
            thumbnailSrc: '',
            customThumbnailSrc: '',
            thumbnailWidth: null,
            thumbnailHeight: null,
            cardWidth: 'regular',
            loop: false,
        },
    },
};
