/* eslint-env node */

// eslint-disable-next-line functional/no-expression-statements, functional/immutable-data
module.exports = function (api) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, functional/no-expression-statements
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            src: './src',
            '^fp$': './src/utils/fp',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  }
}
