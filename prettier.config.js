module.exports = {
  semi: true,
  arrowParens: "always",
  trailingComma: "none",
  printWidth: 120,
  bracketSpacing: true,
  proseWrap: "always",
  plugins: [require("prettier-plugin-tailwindcss")],
  tailwindConfig: "./tailwind.config.js"
};
