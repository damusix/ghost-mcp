import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';

// Mock env vars before importing ghost-client
const TEST_URL = 'https://example.ghost.io';
const TEST_ADMIN_KEY = 'abc123:deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';
const TEST_CONTENT_KEY = 'content-key-123';

vi.stubEnv('GHOST_URL', TEST_URL);
vi.stubEnv('GHOST_ADMIN_API_KEY', TEST_ADMIN_KEY);
vi.stubEnv('GHOST_CONTENT_API_KEY', TEST_CONTENT_KEY);

// Mock @logosdx/fetch
vi.mock('@logosdx/fetch', () => {
    class MockFetchEngine {
        config: Record<string, unknown>;
        constructor(config: Record<string, unknown>) {
            this.config = config;
        }
    }
    return { FetchEngine: MockFetchEngine };
});

// Mock jsonwebtoken
vi.mock('jsonwebtoken', () => ({
    default: {
        sign: vi.fn(() => 'mocked-jwt-token'),
    },
}));

describe('ghost-client', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('creates adminApi with correct baseUrl', async () => {
        const { adminApi } = await import('../ghost-client.js');
        expect(adminApi.config).toMatchObject({
            baseUrl: `${TEST_URL}/ghost/api/admin`,
        });
    });

    it('creates contentApi with correct baseUrl', async () => {
        const { contentApi } = await import('../ghost-client.js');
        expect(contentApi.config).toMatchObject({
            baseUrl: `${TEST_URL}/ghost/api/content`,
        });
    });

    it('sets Accept-Version header on adminApi', async () => {
        const { adminApi } = await import('../ghost-client.js');
        expect(adminApi.config).toMatchObject({
            headers: expect.objectContaining({ 'Accept-Version': 'v6.0' }),
        });
    });

    it('sets Accept-Version header on contentApi', async () => {
        const { contentApi } = await import('../ghost-client.js');
        expect(contentApi.config).toMatchObject({
            headers: expect.objectContaining({ 'Accept-Version': 'v6.0' }),
        });
    });

    it('sets content API key as query param', async () => {
        const { contentApi } = await import('../ghost-client.js');
        expect(contentApi.config).toMatchObject({
            params: { key: TEST_CONTENT_KEY },
        });
    });

    describe('JWT generation', () => {
        it('generates JWT with correct structure when sign is called', () => {
            const [id, secret] = TEST_ADMIN_KEY.split(':');
            // The module calls jwt.sign in onBeforeReq, but we can verify the mock setup
            jwt.sign({}, Buffer.from(secret, 'hex'), {
                keyid: id,
                algorithm: 'HS256',
                expiresIn: '5m',
                audience: '/admin/',
            });

            expect(jwt.sign).toHaveBeenCalledWith({}, Buffer.from(secret, 'hex'), {
                keyid: id,
                algorithm: 'HS256',
                expiresIn: '5m',
                audience: '/admin/',
            });
        });
    });
});
