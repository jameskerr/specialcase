/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./hugo_stats.json"],
  theme: {
    extend: {},
  },
  corePlugins: {
    preflight: false,
    textOpacity: false,
    backgroundOpacity: false,
    borderOpacity: false,
  },
  experimental: {
    optimizeUniversalDefaults: true,
  },
  blocklist: ["container"],
};
