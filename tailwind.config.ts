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
  		backgroundImage: {
  			'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
  			'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))'
  		},
  		colors: {
  			'blue': '#475CC6',
  			'med-gray': '#00000099',
        'focus-gray': '#636363',
        'light-gray': '#EAEAEA',
        'profile-orange': '#FFBFBF',
        'profile-yellow': '#FFFA96',
        'profile-green': '#90C399',
        'profile-teal': '#7BBAD1',
        'profile-indigo': '#778EFF',
        'profile-pink': '#F8A5FF',
        'error-red': '#ff4e4e',
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
			typography: {
				DEFAULT: {
					css: {
						maxWidth: '100%',
					}
				}
			}
  	}
  },
  plugins: [require("tailwindcss-animate"), require('@tailwindcss/typography')],
};
export default config;
