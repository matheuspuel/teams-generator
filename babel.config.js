module.exports = function (api) {
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
