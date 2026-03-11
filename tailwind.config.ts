import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#14213d",
        sky: "#d8f3ff",
        sand: "#fff8eb",
        ember: "#ef5b3f",
        forest: "#1f6f50",
      },
      boxShadow: {
        soft: "0 12px 35px rgba(20, 33, 61, 0.12)",
      },
      fontFamily: {
        display: ["Georgia", "serif"],
        body: ["ui-sans-serif", "system-ui", "sans-serif"],
      }
    },
  },
  plugins: [],
};

export default config;
