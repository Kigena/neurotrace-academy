import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node',
        include: ['tests/**/*.test.js'],
        globalSetup: ['tests/globalSetup.js'],
        setupFiles: ['tests/setupEnv.js'],
        testTimeout: 60000,
        hookTimeout: 120000,
        pool: 'forks',
    },
});
