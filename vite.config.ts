import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/postcss';
import {fileURLToPath} from 'node:url';
export default defineConfig({plugins:[react()],css:{postcss:{plugins:[tailwind()]}},resolve:{alias:{'@':fileURLToPath(new URL('.',import.meta.url)),'next/link':fileURLToPath(new URL('./web/link.tsx',import.meta.url)),'next/navigation':fileURLToPath(new URL('./web/navigation.ts',import.meta.url))}},build:{outDir:'dist',sourcemap:false}});
