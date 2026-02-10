import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        costco: {
          red: "#E31837",
          blue: "#005DAA",
        },
        warning: "#FF6B35",
        success: "#4CAF50",
        "light-bg": "#F8F8F8",
        "dark-bg": "#121212",
        "dark-card": "#1E1E1E",
      },
      fontFamily: {
        pretendard: [
          "Pretendard",
          "Apple SD Gothic Neo",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
export default config;
