import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        turno: {
          am: "#3B82F6",
          pm: "#F59E0B",
          libre: "#10B981",
          vac: "#EF4444",
          full: "#8B5CF6"
        }
      }
    }
  },
  plugins: []
};

export default config;
