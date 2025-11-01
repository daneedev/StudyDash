// tailwind.config.js
const {heroui, colors} = require("@heroui/react");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // ...
    // make sure it's pointing to the ROOT node_module
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#39b6ab",
        background: "#1c1c1c",
        text: "#f6f7fb",
        secondary:"#272727"
      },

    },
  },
  darkMode: "class",
  plugins: [heroui()],
};