import { ExpoConfig } from '@expo/config-types'
import packageJSON from './package.json'

const getConfig = (): ExpoConfig => ({
  name:
    'Sorteio de Times' +
    matchEnv({
      production: '',
      staging: ' (staging)',
      sponsor: ' (preview)',
      preview: ' (preview)',
      development: ' (dev)',
    }),
  slug: 'sorteio-times',
  owner: 'matheuspuel',
  version: packageJSON.version,
  runtimeVersion: packageJSON.version,
  icon: './assets/icon.png',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
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
    enabled: matchEnv({
      development: true,
      preview: true,
      sponsor: true,
      staging: false,
      production: false,
    }),
    fallbackToCacheTimeout: 0,
    url: 'https://u.expo.dev/b5fe0e17-a64d-4005-b833-a57c2f04b664',
  },
  assetBundlePatterns: ['**/*'],
  packagerOpts: {
    config: 'metro.config.js',
  },
  android: {
    package:
      'dev.matheuspuel.sorteiotimes' +
      matchEnv({
        production: '',
        staging: '.staging',
        sponsor: '.sponsor',
        preview: '.preview',
        development: '.development',
      }),
    adaptiveIcon: {
      backgroundColor: '#136d15',
      foregroundImage:
        './assets/adaptive-icon' +
        matchEnv({
          production: '',
          staging: '-staging',
          sponsor: '-sponsor',
          preview: '-preview',
          development: '-dev',
        }) +
        '.png',
    },
    intentFilters: [
      {
        autoVerify: true,
        action: 'VIEW',
        data: [{ mimeType: 'application/json' }],
        category: ['DEFAULT'],
      },
    ],
  },
  web: { favicon: './assets/favicon.png' },
  extra: {
    envName,
    eas: { projectId: 'b5fe0e17-a64d-4005-b833-a57c2f04b664' },
  },
  plugins: ['expo-localization'],
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
    : APP_VARIANT === 'sponsor'
    ? APP_VARIANT
    : APP_VARIANT === 'preview'
    ? APP_VARIANT
    : APP_VARIANT === 'development'
    ? APP_VARIANT
    : APP_VARIANT === undefined
    ? 'development'
    : fatal('Unknown app environment')

const matchEnv = <D, PW, SP, S, P>(cases: {
  development: D
  preview: PW
  sponsor: SP
  staging: S
  production: P
}) => cases[envName]

export default getConfig()
