import { vitePlugin as remix } from '@remix-run/dev';
import { defineConfig } from 'vite';
import { vercelPreset } from '@vercel/remix/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import mdx from '@mdx-js/rollup';
import remarkFrontMatter from 'remark-frontmatter';
import remarkMdxFrontMatter from 'remark-mdx-frontmatter';

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    tsconfigPaths(),
    mdx({
      remarkPlugins: [
        remarkFrontMatter,
        remarkMdxFrontMatter,
      ],
    }),
    remix({
        ignoredRouteFiles: ['**/.*'],
        presets: [vercelPreset()],
      },
    ),
  ],
});
