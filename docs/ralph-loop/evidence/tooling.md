# Tooling R&D Evidence

> Sources: https://viteplus.dev/guide/, https://logosdx.dev/packages/fetch/ (fetched 2026-03-29)

## Vite+ (vp)

Unified toolchain: Vite + Vitest + Oxlint + Oxfmt + Rolldown + tsdown + Vite Task.

### Key Commands

| Command | Purpose |
|---------|---------|
| `vp create` | Generate new project |
| `vp install` | Install deps (wraps package manager) |
| `vp dev` | Dev server |
| `vp check` | Format + lint + typecheck simultaneously |
| `vp test` | Run tests (Vitest) |
| `vp build` | Build app |
| `vp pack` | Build library / standalone artifact |
| `vp lint` | Lint only |
| `vp fmt` | Format only |
| `vp run <script>` | Run custom package.json scripts |

### Notes
- Built-in commands (`vp build`, `vp test`, `vp dev`) are predefined, unchangeable
- Custom scripts via `vp run <command>`
- Package manager: PNPM (user preference)
- Tests: Vitest (built-in)

## @logosdx/fetch (FetchEngine)

Production-ready HTTP client wrapping native Fetch API.

### Install
```bash
pnpm add @logosdx/fetch
```

### Core API

```typescript
import { FetchEngine } from '@logosdx/fetch';

const api = new FetchEngine({
    baseUrl: 'https://example.ghost.io/ghost/api',
    defaultType: 'json',
    totalTimeout: 5000
});

// Methods - all return FetchPromise<T> → FetchResponse<T>
api.get<T>(path)
api.post<T>(path, payload)
api.put<T>(path, payload)
api.patch<T>(path, payload)
api.delete(path)
api.head(path)
api.options(path)
api.request<T>(method, path, options)
```

### FetchResponse<T>
- `data` - Parsed response body
- `status` - HTTP status code
- `headers` - Response headers
- `config` - Request config

### Features
- Automatic retries with exponential backoff
- Request deduplication
- Response caching with stale-while-revalidate
- Configurable timeouts
- Request cancellation
- Lifecycle events & hooks
- Plugin architecture
- Type-safe generics throughout

### Typed Configuration
```typescript
new FetchEngine<Headers, Params, State, ResponseHeaders>(config)
```

Properties: `state`, `config`, `headers`, `params`

### Error Handling
```typescript
import { attempt } from '@logosdx/utils';
const [response, err] = await attempt(() => api.get<User[]>('/users'));
```

### Global Instance
```typescript
import fetch from '@logosdx/fetch';
// Named exports: get, post, put, patch, del, head, options, request, headers, params, state, config, on, off
```
