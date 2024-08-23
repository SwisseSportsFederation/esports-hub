import { sentryVitePlugin } from "@sentry/vite-plugin";
import { vitePlugin as remix } from '@remix-run/dev';
import { defineConfig } from 'vite';
import { vercelPreset } from '@vercel/remix/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import mdx from '@mdx-js/rollup';
import remarkFrontMatter from 'remark-frontmatter';
import remarkMdxFrontMatter from 'remark-mdx-frontmatter';
import { flatRoutes } from 'remix-flat-routes';

export default defineConfig({
  server: {
    port: 3000,
  },

  plugins: [tsconfigPaths(), mdx({
    remarkPlugins: [
      remarkFrontMatter,
      remarkMdxFrontMatter,
    ],
  }), remix({
    presets: [vercelPreset()],
    ignoredRouteFiles: ['**/*'],
    routes: async defineRoutes => {
      return flatRoutes('routes', defineRoutes);
    },
  },
  ), sentryVitePlugin({
    org: "polylan",
    project: "esports-hub",
    url: "https://sentry2.polylan.ch"
  })],

  build: {
    sourcemap: true
  }
});
