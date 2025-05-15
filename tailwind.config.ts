import type { Config } from "tailwindcss";

const config: Config = {
	darkMode: ["class"],
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				},
				primary: {
					50: '#F6F6F9',
					100: '#ECECF3',
					200: '#D9D9E8',
					300: '#C6C6DD',
					400: '#B1B1D3',
					DEFAULT: '#1A1A2E',
					600: '#141426',
					700: '#0F0F1C',
					800: '#0A0A13',
					900: '#050509'
				},
				secondary: {
					50: '#F1FDF7',
					100: '#E3FCEF',
					200: '#C5FCDF',
					300: '#A8FACF',
					400: '#85FFBF',
					DEFAULT: '#00FF79',
					600: '#05C761',
					700: '#049549',
					800: '#036331',
					900: '#013218'
				},
				textColor: {
					DEFAULT: '#1A1A2E',
					ticket: '#00FF79',
					white: '#FFF',
					black: '#000',
				},
				myBuyersButton: {
					bgFrom: '#FFC301',
					bgTo: '#CC9C01',
					textColor: '#1A1A2E',
				  },
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
};
export default config;
