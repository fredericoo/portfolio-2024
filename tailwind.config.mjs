import typographyPlugin from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		fontFamily: {
			display: ['neue-haas-grotesk-display'],
			body: ['neue-haas-grotesk-text'],
		},
		colors: {
			white: 'white',
			transparent: 'transparent',
			neutral: {
				dark: '#1A1523',
				base: '#776E6F',
				light: '#86848D',
				lightest: '#E4E4E4',
			},
			accent: {
				base: 'var(--colors-accent-base)',
			},
		},
		transitionTimingFunction: {
			'expo-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
		},
		extend: {
			typography: ({ theme }) => ({
				DEFAULT: {
					css: {
						'--tw-prose-body': theme('colors.neutral.base'),
						'--tw-prose-headings': theme('colors.neutral.dark'),
						'--tw-prose-lead': theme('colors.neutral.light'),
						'--tw-prose-links': theme('colors.neutral.dark'),
						'--tw-prose-bold': theme('colors.neutral.dark'),
						'--tw-prose-counters': theme('colors.neutral.lightest'),
						'--tw-prose-bullets': theme('colors.neutral.lightest'),
						'--tw-prose-hr': theme('colors.neutral.lightest'),
						'--tw-prose-quotes': theme('colors.neutral.dark'),
						'--tw-prose-quote-borders': theme('colors.neutral.lightest'),
						'--tw-prose-captions': theme('colors.neutral.light'),
						'--tw-prose-code': theme('colors.neutral.dark'),
						'--tw-prose-pre-code': theme('colors.neutral.lightest'),
						'--tw-prose-pre-bg': theme('colors.neutral.dark'),
						'--tw-prose-th-borders': theme('colors.neutral.lightest'),
						'--tw-prose-td-borders': theme('colors.neutral.lightest'),
						'--tw-prose-invert-body': theme('colors.neutral.lightest'),
						'--tw-prose-invert-headings': theme('colors.white'),
						'--tw-prose-invert-lead': theme('colors.neutral.lightest'),
						'--tw-prose-invert-links': theme('colors.white'),
						'--tw-prose-invert-bold': theme('colors.white'),
						'--tw-prose-invert-counters': theme('colors.neutral.lightest'),
						'--tw-prose-invert-bullets': theme('colors.neutral.lightest'),
						'--tw-prose-invert-hr': theme('colors.neutral.light'),
						'--tw-prose-invert-quotes': theme('colors.neutral.lightest'),
						'--tw-prose-invert-quote-borders': theme('colors.neutral.light'),
						'--tw-prose-invert-captions': theme('colors.neutral.lightest'),
						'--tw-prose-invert-code': theme('colors.white'),
						'--tw-prose-invert-pre-code': theme('colors.neutral.lightest'),
						'--tw-prose-invert-pre-bg': 'rgb(0 0 0 / 50%)',
						'--tw-prose-invert-th-borders': theme('colors.neutral.lightest'),
						'--tw-prose-invert-td-borders': theme('colors.neutral.light'),
					},
				},
			}),
		},
	},
	plugins: [typographyPlugin],
};
