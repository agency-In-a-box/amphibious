import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import postcssPresetEnv from 'postcss-preset-env';

const isProd = process.env.NODE_ENV === 'production';

export default {
  plugins: [
    // Modern CSS features and fallbacks
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
        grid: 'autoplace',
      },
    }),

    // Add vendor prefixes
    autoprefixer({
      cascade: false,
      grid: 'autoplace',
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
