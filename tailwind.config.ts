import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#FAFAF9",
        ink: "#161618",
        accent: {
          DEFAULT: "#4F46E5",
          dark: "#3730A3",
          soft: "#EEF2FF",
        },
        line: "#E5E5E3",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
