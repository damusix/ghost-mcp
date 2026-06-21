// Resolve a block list from either an inline array or an absolute JSON file.
// File mode lets a client compose long posts in its own working file (validating
// as it edits) and pass just the path, instead of re-emitting the whole array.
import { readFileSync } from 'node:fs';
import { isAbsolute } from 'node:path';
import { isRecord } from '../koenig/util.js';

export interface BlocksSource {
    blocks?: unknown[];
    blockFile?: string;
}

function extractBlocks(parsed: unknown): unknown[] | null {
    if (Array.isArray(parsed)) {
        return parsed;
    }
    if (isRecord(parsed) && Array.isArray(parsed.blocks)) {
        return parsed.blocks;
    }
    return null;
}

export function resolveBlocks(src: BlocksSource): unknown[] {
    const hasFile = typeof src.blockFile === 'string' && src.blockFile.trim() !== '';

    if (Array.isArray(src.blocks)) {
        if (hasFile) {
            throw new Error('provide either "blocks" or "blockFile", not both');
        }
        return src.blocks;
    }

    if (!hasFile) {
        throw new Error(
            'provide "blocks" (inline array) or "blockFile" (absolute path to a JSON file of blocks)',
        );
    }

    const file = src.blockFile;
    if (typeof file !== 'string') {
        throw new Error('blockFile must be a string path');
    }
    if (!isAbsolute(file)) {
        throw new Error(
            `blockFile must be an absolute path (got "${file}"). Write the JSON to an absolute path, e.g. under your tmp/ directory.`,
        );
    }

    let raw: string;
    try {
        raw = readFileSync(file, 'utf8');
    } catch {
        throw new Error(`could not read blockFile: ${file}`);
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch {
        throw new Error(`blockFile is not valid JSON: ${file}`);
    }

    const blocks = extractBlocks(parsed);
    if (!blocks) {
        throw new Error(
            `blockFile must contain a JSON array of blocks, or { "blocks": [...] }: ${file}`,
        );
    }
    return blocks;
}
