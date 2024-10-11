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
        'med-gray': '#00000099',
        'dropdown-gray': '#f2f2f2'
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
