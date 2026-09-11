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
        background: "#0D0D0D",
        surface: {
          DEFAULT: "#141414",
          dim: "#131313",
          bright: "#3a3939",
          container: "#1A1A1A",
          "container-lowest": "#0D0D0D",
          "container-low": "#141414",
          "container-high": "#202020",
          "container-highest": "#2A2A2A",
        },
        "on-surface": "#F5F5F5",
        "on-surface-variant": "#A1A1A1",
        outline: "#8E9192",
        "outline-variant": "#292929",
        "border-subtle": "#202020",
        primary: {
          DEFAULT: "#FFFFFF",
          fixed: "#E2E2E2",
          "fixed-dim": "#C6C6C7",
        },
        secondary: {
          DEFAULT: "#C7C6C6",
          container: "#484949",
          "fixed-dim": "#C7C6C6",
        },
        tertiary: {
          DEFAULT: "#FFFFFF",
          "fixed-dim": "#4DA3FF",
        },
        bull: {
          DEFAULT: "#4DA3FF",
          subtle: "rgba(77, 163, 255, 0.1)",
          border: "rgba(77, 163, 255, 0.2)",
        },
        bear: {
          DEFAULT: "#E7A94B",
          subtle: "rgba(231, 169, 75, 0.1)",
          border: "rgba(231, 169, 75, 0.2)",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["Inter", "SF Mono", "Roboto Mono", "monospace"],
      },
      spacing: {
        "space-xs": "0.25rem",
        "space-sm": "0.5rem",
        "space-md": "0.75rem",
        "space-lg": "1rem",
        "space-xl": "1.5rem",
        gutter: "1rem",
        "gutter-desktop": "1.5rem",
        margin: "1rem",
        "margin-desktop": "2rem",
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        sm: "0.125rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.625rem",
        "2xl": "0.75rem",
      },
    },
  },
  plugins: [],
};

export default config;
