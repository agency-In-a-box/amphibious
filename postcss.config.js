import postcssGlobalData from '@csstools/postcss-global-data';
import cssnano from 'cssnano';
import postcssPresetEnv from 'postcss-preset-env';
import guardDarkMode from './scripts/postcss-guard-dark-mode.js';

const isProd = process.env.NODE_ENV === 'production';

export default {
  plugins: [
    // Standalone page stylesheets use @media (--bp-*) without defining the
    // tokens themselves; expose them to every file so @custom-media always resolves.
    postcssGlobalData({ files: ['./src/css/tokens/breakpoints.css'] }),

    // Scope system-dark rules so data-theme="light" always wins
    guardDarkMode(),

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
