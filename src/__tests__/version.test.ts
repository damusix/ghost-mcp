import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';
import { VERSION } from '../version.js';

const require = createRequire(import.meta.url);
const packageJson = require('../../package.json') as { version: string };

describe('VERSION', () => {
    it('matches package.json', () => {
        expect(VERSION).toBe(packageJson.version);
    });
});
