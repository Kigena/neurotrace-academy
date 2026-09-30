import { defineConfig } from 'vitest/config';

// Frontend tests. Server tests live in server/ and run with their own config.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/frontend/**/*.test.{js,jsx}'],
  },
});
