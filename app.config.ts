import { ExpoConfig } from '@expo/config-types'
import packageJSON from './package.json'

const getConfig = (): ExpoConfig => ({
  name:
    'Sorteio de Times' +
    matchEnv({
      production: '',
      staging: ' (staging)',
      preview: ' (preview)',
      development: ' (dev)',
    }),
  slug: 'sorteio-times',
  owner: 'matheuspuel',
  version: packageJSON.version,
  orientation: 'portrait',
  icon: './assets/icon.png',
  androidStatusBar: {
    barStyle: 'light-content',
    backgroundColor: '#136d15',
  },
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#136d15',
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ['**/*'],
  packagerOpts: {
    config: 'metro.config.js',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier:
      'dev.matheuspuel.sorteiotimes' +
      matchEnv({
        production: '',
        staging: '.staging',
        preview: '.preview',
        development: '.development',
      }),
  },
  android: {
    package:
      'dev.matheuspuel.sorteiotimes' +
      matchEnv({
        production: '',
        staging: '.staging',
        preview: '.preview',
        development: '.development',
      }),
    versionCode: 5,
    adaptiveIcon: {
      backgroundColor: '#136d15',
      foregroundImage:
        './assets/adaptive-icon' +
        matchEnv({
          production: '',
          staging: '-staging',
          preview: '-preview',
          development: '-dev',
        }) +
        '.png',
    },
  },
  web: {
    favicon: './assets/favicon.png',
  },
  extra: {
    envName,
    eas: { projectId: 'b5fe0e17-a64d-4005-b833-a57c2f04b664' },
  },
})

// Helpers

const fatal = (reason: string): never => {
  // eslint-disable-next-line functional/no-throw-statements
  throw new Error(reason)
}

const APP_VARIANT = process.env.APP_VARIANT

const envName =
  APP_VARIANT === 'production'
    ? APP_VARIANT
    : APP_VARIANT === 'staging'
    ? APP_VARIANT
    : APP_VARIANT === 'preview'
    ? APP_VARIANT
    : APP_VARIANT === 'development'
    ? APP_VARIANT
    : APP_VARIANT === undefined
    ? 'development'
    : fatal('Unknown app environment')

const matchEnv = <D, PW, S, P>(cases: {
  development: D
  preview: PW
  staging: S
  production: P
}) => cases[envName]

export default getConfig()
