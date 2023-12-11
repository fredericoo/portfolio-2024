/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		fontFamily: {
			display: ['neue-haas-grotesk-display'],
			body: ['neue-haas-grotesk-text'],
		},
		colors: {
			neutral: {
				dark: '#1A1523',
				base: '#776E6F',
				light: '#86848D',
				lightest: '#E4E4E4',
			},
		},
		transitionTimingFunction: {
			'expo-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
		},
		extend: {},
	},
	plugins: [],
};
