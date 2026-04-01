import { FetchEngine, config as globalFetchConfig } from '@logosdx/fetch';
import type { FetchError } from '@logosdx/fetch';
import jwt from 'jsonwebtoken';

const GHOST_URL = process.env.GHOST_URL || '';
const GHOST_ADMIN_API_KEY = process.env.GHOST_ADMIN_API_KEY || '';
const GHOST_CONTENT_API_KEY = process.env.GHOST_CONTENT_API_KEY || '';
const GHOST_API_VERSION = process.env.GHOST_API_VERSION || 'v6.0';
const GHOST_RATE_LIMIT = Number(process.env.GHOST_RATE_LIMIT) || 50;

function generateAdminToken(): string {
    const [id, secret] = GHOST_ADMIN_API_KEY.split(':');
    const token = jwt.sign({}, Buffer.from(secret, 'hex'), {
        keyid: id,
        algorithm: 'HS256',
        expiresIn: '5m',
        audience: '/admin/',
    });
    return token;
}

const resilience = {
    attemptTimeout: 15000,
    totalTimeout: 45000,

    retry: {
        maxAttempts: 3,
        baseDelay: 1000,
        maxDelay: 10000,
        useExponentialBackoff: true,
        retryableStatusCodes: [408, 429, 500, 502, 503, 504],
        shouldRetry: (error: FetchError, _attempt: number) => {
            if (error.status === 429) {
                const retryAfter = error.headers?.['retry-after'];
                return retryAfter ? parseInt(retryAfter as string) * 1000 : 5000;
            }
            if (error.status >= 400 && error.status < 500) {
                return false;
            }
            return true;
        },
    },

    cachePolicy: {
        enabled: true,
        methods: ['GET'] as const,
        ttl: 3_600_000,
        staleIn: 10_000,
    },

    dedupePolicy: true as const,

    rateLimitPolicy: {
        maxCalls: GHOST_RATE_LIMIT,
        windowMs: 60_000,
        waitForToken: true,
    },
};

export const adminApi = new FetchEngine({
    baseUrl: `${GHOST_URL}/ghost/api/admin`,
    defaultType: 'json',
    headers: {
        'Accept-Version': GHOST_API_VERSION,
        'Content-Type': 'application/json',
        Authorization: `Ghost ${generateAdminToken()}`,
    },
    ...resilience,
});

adminApi.hooks.add('beforeRequest', (url, opts) => {
    opts.headers.Authorization = `Ghost ${generateAdminToken()}`;
});

export const contentApi = new FetchEngine({
    baseUrl: `${GHOST_URL}/ghost/api/content`,
    defaultType: 'json',
    headers: {
        'Accept-Version': GHOST_API_VERSION,
        'Content-Type': 'application/json',
    },
    params: {
        key: GHOST_CONTENT_API_KEY,
    },
    ...resilience,
});

export const docsApi = new FetchEngine({
    baseUrl: 'https://docs.ghost.org',
    defaultType: 'text',
    attemptTimeout: 15000,
    totalTimeout: 45000,
    retry: {
        maxAttempts: 3,
        baseDelay: 1000,
        maxDelay: 10000,
        useExponentialBackoff: true,
    },
    cachePolicy: {
        enabled: true,
        methods: ['GET'] as const,
        ttl: 3_600_000,
        staleIn: 10_000,
    },
    dedupePolicy: true as const,
});

// Configure global fetch instance for raw downloads (image/theme uploads)
// No auth, no cache — just retry and dedupe
globalFetchConfig.set({
    attemptTimeout: 15000,
    totalTimeout: 45000,
    retry: {
        maxAttempts: 3,
        baseDelay: 1000,
        maxDelay: 10000,
        useExponentialBackoff: true,
    },
    dedupePolicy: true,
});
