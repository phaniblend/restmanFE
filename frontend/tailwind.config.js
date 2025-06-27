/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#f97316',
        secondary: '#ea580c',
        accent: '#dc2626',
        neutral: '#6b7280',
        'restman-orange': '#f97316',
        'restman-red': '#dc2626',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-restman': 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #dc2626 100%)',
        'gradient-hero': 'linear-gradient(135deg, #f97316 0%, #dc2626 100%)',
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      boxShadow: {
        'restman': '0 8px 32px rgba(249, 115, 22, 0.3)',
        'glow': '0 4px 20px rgba(249, 115, 22, 0.4)',
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        restman: {
          primary: "#f97316",
          secondary: "#ea580c",
          accent: "#dc2626",
          neutral: "#374151",
          "base-100": "#ffffff",
          "base-200": "#fef7ed",
          "base-300": "#fed7aa",
          info: "#3b82f6",
          success: "#10b981",
          warning: "#f59e0b",
          error: "#ef4444",
        },
      },
      "light",
      "dark",
    ],
    base: true,
    styled: true,
    utils: true,
    rtl: false,
    prefix: "",
    logs: true,
  },
} 