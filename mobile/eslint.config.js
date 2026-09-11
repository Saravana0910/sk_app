const { FlatCompat } = require('@eslint/eslintrc');

// Stops ESLint's flat-config discovery here instead of climbing up to the
// unrelated Salesforce DX (LWC) eslint.config.js at the repo root.
const compat = new FlatCompat({ baseDirectory: __dirname });

module.exports = [
  ...compat.extends('@react-native'),
];
