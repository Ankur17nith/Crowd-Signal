import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#08090D",
        surface: {
          DEFAULT: "#0F1117",
          subtle: "#141721",
          elevated: "#1A1E2B",
          border: "#232838",
          borderHover: "#323B52",
        },
        brand: {
          DEFAULT: "#00E5FF",
          subtle: "#00B4D8",
          dark: "#0077B6",
        },
        bull: {
          DEFAULT: "#10B981",
          bright: "#34D399",
          tint: "rgba(16, 185, 129, 0.12)",
          border: "rgba(16, 185, 129, 0.3)",
        },
        bear: {
          DEFAULT: "#F43F5E",
          bright: "#FB7185",
          tint: "rgba(244, 63, 94, 0.12)",
          border: "rgba(244, 63, 94, 0.3)",
        },
        metric: {
          neutral: "#94A3B8",
          dim: "#64748B",
          highlight: "#F8FAFC",
        },
      },
      fontFamily: {
        mono: ["SF Mono", "Fira Code", "Roboto Mono", "monospace"],
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        terminal: "0 4px 20px -2px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.05)",
        highlight: "0 0 15px -3px rgba(0, 229, 255, 0.15)",
        bull: "0 0 15px -3px rgba(16, 185, 129, 0.2)",
        bear: "0 0 15px -3px rgba(244, 63, 94, 0.2)",
      },
      keyframes: {
        pulseDot: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.4", transform: "scale(0.85)" },
        },
      },
      animation: {
        pulseDot: "pulseDot 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
