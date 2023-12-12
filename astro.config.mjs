import { defineConfig, passthroughImageService, squooshImageService } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import markdoc from '@astrojs/markdoc';

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind({
    applyBaseStyles: false
  }), markdoc(), react()]
});