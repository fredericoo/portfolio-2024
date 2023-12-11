import { z, defineCollection } from 'astro:content';

const projects = defineCollection({
	type: 'content',
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			subtitle: z.string().optional(),
			placement: z.enum(['tr', 'tl', 'br', 'bl']).default('tl'),
			image: image(),
			imageAlt: z.string(),
			externalLink: z.string().url().optional(),
			grid: z.enum(['square', 'wide', 'tall']).default('square'),
			publishedAt: z.date(),
		}),
});

export const collections = {
	projects,
};
