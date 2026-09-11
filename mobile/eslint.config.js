const { FlatCompat } = require('@eslint/eslintrc');

// Stops ESLint's flat-config discovery here instead of climbing up to the
// unrelated Salesforce DX (LWC) eslint.config.js at the repo root.
const compat = new FlatCompat({ baseDirectory: __dirname });

module.exports = [
  {
    ignores: ['mobile_sdk/**'],
  },
  ...compat.extends('@react-native'),
  {
    rules: {
      'react/no-unstable-nested-components': ['warn', { allowAsProps: true }],
    },
  },
];
