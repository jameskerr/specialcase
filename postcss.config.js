module.exports = {
  plugins: [
    require("postcss-import"),
    require("tailwindcss")({}),
    require("autoprefixer"),
    require("postcss-utopia")({
      minWidth: 320,
      maxWidth: 1080,
    }),
  ],
};
