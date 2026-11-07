import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://anttonias.com',
  output: 'static',
  build: {
    format: 'file'
  },
  compressHTML: true,
  adapter: cloudflare({
    imageService: 'passthrough'
  }),
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp'
    }
  },
  vite: {
    server: {
      allowedHosts: true
    }
  }
});
