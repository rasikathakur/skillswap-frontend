export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        float: {
          "0%": { transform: "translateY(0) rotate(0deg)", opacity: "0" },
          "10%": { opacity: "1" },
          "100%": { transform: "translateY(-120vh) rotate(360deg)", opacity: "0" },
        },
      },
      animation: {
        float: "float 5s linear infinite",
      },
    },
  },
  plugins: [],
}
