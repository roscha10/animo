import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Ánimo — teal que une el verde de Kaimind con el azul de Vikua
        animo: {
          50:  "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",  // primario principal
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
          950: "#042f2e",
        },
        // Verde Kaimind — usado para estados disponible/éxito
        kaimind: {
          DEFAULT: "#26D07C",
          dark:    "#0fa05a",
          light:   "#e6faf2",
        },
        // Colores Vikua — usados para elementos secundarios
        vikua: {
          blue:   "#38BEFC",
          orange: "#FF7335",
          lime:   "#8DC63F",
          dark:   "#2D3142",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
