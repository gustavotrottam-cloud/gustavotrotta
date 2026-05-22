import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0A0A0B",
          900: "#0A0A0B",
          800: "#141417",
          700: "#1B1B1F",
          600: "#26262B",
        },
        paper: {
          DEFAULT: "#FAFAF7",
          50: "#FFFFFF",
          100: "#FAFAF7",
          200: "#F2F1EB",
          300: "#E5E3DA",
        },
        muted: {
          DEFAULT: "#6B6B70",
          400: "#8C8C90",
          500: "#6B6B70",
          600: "#4A4A4E",
        },
        navy: {
          DEFAULT: "#0F1E3A",
          900: "#0A1428",
          800: "#0F1E3A",
          700: "#16294F",
        },
        gold: {
          DEFAULT: "#B8935A",
          400: "#CFA972",
          500: "#B8935A",
          600: "#9B7A45",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Cormorant Garamond", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        editorial: "-0.025em",
        wider2: "0.18em",
        wider3: "0.22em",
      },
      maxWidth: {
        container: "1240px",
        prose2: "62ch",
      },
      transitionTimingFunction: {
        editorial: "cubic-bezier(0.22, 0.61, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
