import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/test/setup.ts'],
        env: {
            VITE_SUPABASE_URL: 'https://test.supabase.co',
            VITE_SUPABASE_ANON_KEY: 'test-anon-key',
            // VITE_SITE_SLUG는 비워둬서 hostname 기반 테스트가 동작하도록 함
            VITE_DEFAULT_SITE: 'test-site',
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@core': path.resolve(__dirname, './src/core'),
            '@modules': path.resolve(__dirname, './src/modules'),
            '@templates': path.resolve(__dirname, './src/templates'),
            '@sites': path.resolve(__dirname, './src/sites'),
            '@lib': path.resolve(__dirname, './src/lib'),
            '@hooks': path.resolve(__dirname, './src/hooks'),
            '@utils': path.resolve(__dirname, './src/utils'),
            '@components': path.resolve(__dirname, './src/components'),
        },
    },
});
