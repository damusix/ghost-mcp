import { defineConfig } from 'vite-plus';

export default defineConfig({
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
