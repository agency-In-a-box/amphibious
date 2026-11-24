import postcssGlobalData from '@csstools/postcss-global-data';
import cssnano from 'cssnano';
import postcssPresetEnv from 'postcss-preset-env';
import themeScope from './scripts/postcss-theme-scope.js';

const isProd = process.env.NODE_ENV === 'production';

export default {
  plugins: [
    // Standalone page stylesheets use @media (--bp-*) without defining the
    // tokens themselves; expose them to every file so @custom-media always resolves.
    postcssGlobalData({ files: ['./src/css/tokens/breakpoints.css'] }),

    // Modern CSS features, fallbacks, and vendor prefixes
    // postcss-preset-env includes autoprefixer — no separate autoprefixer needed
    postcssPresetEnv({
      stage: 3,
      features: {
        'nesting-rules': true,
        'custom-properties': true,
        'custom-media-queries': true,
        'is-pseudo-class': true,
        'focus-visible-pseudo-class': true,
      },
      autoprefixer: {
        cascade: false,
        grid: 'autoplace',
      },
    }),

    // Make `prefers-color-scheme: dark` rules defer to <html data-theme="light">,
    // and honour an explicit data-theme="dark" on a light OS. Zero added specificity.
    themeScope(),

    // Minify CSS in production
    isProd &&
      cssnano({
        preset: [
          'default',
          {
            discardComments: {
              removeAll: true,
            },
            normalizeWhitespace: true,
          },
        ],
      }),
  ].filter(Boolean),
};
