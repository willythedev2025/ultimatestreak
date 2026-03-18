import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eefbf3",
          100: "#d6f5e0",
          200: "#b0eac6",
          300: "#7ddaa4",
          400: "#47c47d",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
        surface: {
          0: "#ffffff",
          1: "#f9fafb",
          2: "#f3f4f6",
          3: "#e5e7eb",
          4: "#d1d5db",
        },
        border: {
          DEFAULT: "#e5e7eb",
          light: "#d1d5db",
          dark: "#9ca3af",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        glow: "0 0 20px rgba(34, 197, 94, 0.12)",
        card: "0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)",
        "card-hover":
          "0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)",
        nav: "0 1px 3px rgba(0, 0, 0, 0.05)",
      },
    },
  },
  plugins: [],
};

export default config;
