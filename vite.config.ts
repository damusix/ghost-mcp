import { defineConfig } from 'vite-plus';

export default defineConfig({
    // Only our own tests under src/. Keeps `tmp/` (throwaway repo clones used for
    // experimentation, e.g. tmp/Ghost, tmp/koenig-repo) out of test discovery.
    test: {
        include: ['src/**/*.{test,spec}.ts'],
        exclude: ['**/node_modules/**', '**/dist/**', 'tmp/**'],
    },
    pack: {
        entry: ['src/index.ts'],
        dts: true,
        format: ['esm'],
        sourcemap: true,
    },
    fmt: {
        ignorePatterns: ['.claude/**'],
        singleQuote: true,
        semi: true,
        printWidth: 100,
        tabWidth: 4,
        useTabs: false,
        trailingComma: 'all',
        experimentalSortPackageJson: true,
    },
});
