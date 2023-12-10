/* eslint-env node */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const base = require('./.eslintrc.js')
// eslint-disable-next-line functional/no-expression-statements, functional/immutable-data
module.exports = {
  ...base,
  extends: [...base.extends, 'prettier'],
  plugins: [...base.plugins, 'prettier'],
  rules: {
    ...base.rules,
    'prettier/prettier': ['warn'],
  },
}
