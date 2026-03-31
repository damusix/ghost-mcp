import { FetchEngine } from '@logosdx/fetch';
import jwt from 'jsonwebtoken';

const GHOST_URL = process.env.GHOST_URL || '';
const GHOST_ADMIN_API_KEY = process.env.GHOST_ADMIN_API_KEY || '';
const GHOST_CONTENT_API_KEY = process.env.GHOST_CONTENT_API_KEY || '';
const GHOST_API_VERSION = process.env.GHOST_API_VERSION || 'v6.0';

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

export const adminApi = new FetchEngine({
    baseUrl: `${GHOST_URL}/ghost/api/admin`,
    defaultType: 'json',
    headers: {
        'Accept-Version': GHOST_API_VERSION,
    },
    onBeforeReq: async (opts) => {
        if (opts.headers) {
            (opts.headers as Record<string, string>)['Authorization'] =
                `Ghost ${generateAdminToken()}`;
        }
    },
});

export const contentApi = new FetchEngine({
    baseUrl: `${GHOST_URL}/ghost/api/content`,
    defaultType: 'json',
    headers: {
        'Accept-Version': GHOST_API_VERSION,
    },
    params: {
        key: GHOST_CONTENT_API_KEY,
    },
});
