/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      screens: {
        'sm': '480px',   // Mobile
        'md': '768px',   // Tablet
        'lg': '1024px',  // Laptop
        'xl': '1366px',  // Desktop
        '2xl': '1920px', // Ultrawide
        '3xl': '2560px', // Super Ultrawide
      },
    },
  },
  plugins: [],
};
