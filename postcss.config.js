import cssnano from 'cssnano';
import postcssPresetEnv from 'postcss-preset-env';

const isProd = process.env.NODE_ENV === 'production';

export default {
  plugins: [
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
