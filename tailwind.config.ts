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
        'theme-blue': '#475CC6',
        'theme-gray': '#636363',
        'theme-med-gray': '#00000099',
        'theme-medlight-gray': "#C7C7C7",
        'theme-lightgray': '#F3F3F3',
        'dropdown-gray': '#f2f2f2',
        'profile-orange': '#FFBFBF',
        'profile-yellow': '#FFFA96',
        'profile-green': '#90C399',
        'profile-teal': '#7BBAD1',
        'profile-indigo': '#778EFF',
        'profile-pink': '#F8A5FF',
        'error-red': '#ff4e4e',
        'error-light-red': '#fff1f1',
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
