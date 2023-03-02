/* eslint-env node */

// eslint-disable-next-line functional/no-expression-statement, functional/immutable-data
module.exports = function (api) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, functional/no-expression-statement
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      '@babel/plugin-proposal-export-namespace-from',
      [
        'module-resolver',
        {
          alias: {
            src: './src',
            '^fp$': './src/utils/fp',
          },
        },
      ],
    ],
  }
}
