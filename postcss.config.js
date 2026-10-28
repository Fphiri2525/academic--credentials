// Tailwind CSS v4 requires the new PostCSS plugin package
// Fixes error: "install @tailwindcss/postcss and update your PostCSS configuration"
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}