// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://rydny1.github.io',
  base: '/Rydny-portfolio',
  integrations: [react()],
});