import { defineConfig, squooshImageService } from 'astro/config';
import tailwind from '@astrojs/tailwind';

import markdoc from '@astrojs/markdoc';

// https://astro.build/config
export default defineConfig({
	image: {
		service: squooshImageService(),
	},
	integrations: [
		tailwind({
			applyBaseStyles: false,
		}),
		markdoc(),
	],
});
