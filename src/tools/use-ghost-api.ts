import { z } from 'zod';
import { attempt } from '@logosdx/utils';
import { adminApi, contentApi } from '../ghost-client.js';
import { getAction } from '../actions/registry.js';
import type { ApiType } from '../actions/registry.js';

export const useGhostApiSchema = z.object({
    api: z
        .enum(['admin', 'content'])
        .describe('Which API to use: "admin" for full access, "content" for read-only public data'),
    action: z.string().describe('Action to execute (e.g. "posts.browse", "members.add")'),
    payload: z
        .record(z.unknown())
        .optional()
        .describe(
            'Action payload — fields depend on the action. Use ghost_api_help to see available fields.',
        ),
});

export type UseGhostApiInput = z.infer<typeof useGhostApiSchema>;

const PATH_PARAMS = ['id', 'slug', 'name'] as const;

function buildPath(template: string, payload: Record<string, unknown>): string {
    let path = template;
    for (const param of PATH_PARAMS) {
        const placeholder = `{${param}}`;
        if (path.includes(placeholder) && payload[param]) {
            path = path.replace(placeholder, encodeURIComponent(String(payload[param])));
        }
    }
    return path;
}

function extractQueryParams(payload: Record<string, unknown>): Record<string, string> {
    const params: Record<string, string> = {};
    for (const [key, value] of Object.entries(payload)) {
        if (PATH_PARAMS.includes(key as (typeof PATH_PARAMS)[number])) {
            continue;
        }
        if (value !== undefined && value !== null) {
            params[key] = String(value);
        }
    }
    return params;
}

function extractBodyPayload(payload: Record<string, unknown>): Record<string, unknown> {
    const body: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(payload)) {
        if (PATH_PARAMS.includes(key as (typeof PATH_PARAMS)[number])) {
            continue;
        }
        if (key === 'updated_at') {
            body[key] = value;
            continue;
        }
        if (value !== undefined) {
            body[key] = value;
        }
    }
    return body;
}

export async function handleUseGhostApi(input: UseGhostApiInput, mode: string): Promise<string> {
    const { api, action, payload = {} } = input;

    // Validate mode restrictions
    if (mode === 'content' && api === 'admin') {
        return JSON.stringify({
            error: 'Admin API is not available in content mode. Set GHOST_API_MODE=admin and provide GHOST_ADMIN_API_KEY to use admin actions.',
        });
    }

    // Look up the action
    const actionDef = getAction(action, api as ApiType);
    if (!actionDef) {
        return JSON.stringify({
            error: `Unknown action "${action}" for ${api} API. Use ghost_api_help to see available actions.`,
        });
    }

    // Validate payload
    const validation = actionDef.inputSchema.safeParse(payload);
    if (!validation.success) {
        return JSON.stringify({
            error: 'Invalid payload',
            details: validation.error.issues.map((i) => ({
                path: i.path.join('.'),
                message: i.message,
            })),
        });
    }

    const validPayload = validation.data as Record<string, unknown>;
    const engine = api === 'admin' ? adminApi : contentApi;
    const path = buildPath(actionDef.path, validPayload);

    // Handle special cases: image/theme upload
    if (actionDef.name === 'images.upload' || actionDef.name === 'themes.upload') {
        return await handleFileUpload(actionDef.name, validPayload, path);
    }

    if (actionDef.method === 'GET') {
        const queryParams = extractQueryParams(validPayload);
        const [response, err] = await attempt(async () =>
            engine.get(path, { params: queryParams }),
        );
        if (err) {
            return JSON.stringify({ error: err.message });
        }
        return JSON.stringify(response);
    }

    if (actionDef.method === 'DELETE') {
        const [response, err] = await attempt(async () => engine.delete(path));
        if (err) {
            return JSON.stringify({ error: err.message });
        }
        return JSON.stringify(response ?? { success: true });
    }

    // POST or PUT — build body wrapped in resource key
    const resourceKey = actionDef.name.split('.')[0];
    const body = extractBodyPayload(validPayload);
    const wrappedBody = { [resourceKey]: [body] };

    if (actionDef.method === 'POST') {
        const [response, err] = await attempt(async () => engine.post(path, wrappedBody));
        if (err) {
            return JSON.stringify({ error: err.message });
        }
        return JSON.stringify(response);
    }

    if (actionDef.method === 'PUT') {
        const [response, err] = await attempt(async () => engine.put(path, wrappedBody));
        if (err) {
            return JSON.stringify({ error: err.message });
        }
        return JSON.stringify(response);
    }

    return JSON.stringify({ error: `Unsupported method: ${actionDef.method}` });
}

async function handleFileUpload(
    actionName: string,
    payload: Record<string, unknown>,
    path: string,
): Promise<string> {
    const fileInput = payload.file as string;
    const ref = payload.ref as string | undefined;

    // Download file if URL
    let fileBuffer: Buffer;
    let filename: string;

    if (fileInput.startsWith('http://') || fileInput.startsWith('https://')) {
        const [response, err] = await attempt(async () => fetch(fileInput));
        if (err) {
            return JSON.stringify({ error: `Failed to download file: ${err.message}` });
        }
        if (!response!.ok) {
            return JSON.stringify({
                error: `Failed to download file: ${response!.status} ${response!.statusText}`,
            });
        }
        fileBuffer = Buffer.from(await response!.arrayBuffer());
        const urlPath = new URL(fileInput).pathname;
        filename =
            urlPath.split('/').pop() ||
            (actionName === 'images.upload' ? 'image.jpg' : 'theme.zip');
    } else {
        // Base64
        fileBuffer = Buffer.from(fileInput, 'base64');
        filename = actionName === 'images.upload' ? 'image.jpg' : 'theme.zip';
    }

    // Build multipart form
    const formData = new FormData();
    const blob = new Blob([new Uint8Array(fileBuffer)]);
    formData.append('file', blob, filename);
    if (ref) {
        formData.append('ref', ref);
    }

    const [response, err] = await attempt(async () =>
        adminApi.post(path, formData, {
            headers: { 'Content-Type': undefined as unknown as string },
        }),
    );
    if (err) {
        return JSON.stringify({ error: err.message });
    }
    return JSON.stringify(response);
}
