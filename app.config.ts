import { ExpoConfig } from '@expo/config-types'
import packageJSON from './package.json'

const brandColor = '#136d15'

const getConfig = (): ExpoConfig => ({
  name:
    'Teams Generator' +
    matchEnv({
      production: '',
      staging: ' (staging)',
      preview: ' (preview)',
      development: ' (dev)',
    }),
  slug: 'teams-generator',
  owner: 'matheuspuel',
  version: packageJSON.version,
  runtimeVersion: versionWithZeroPatch(packageJSON.version),
  icon: './assets/icon.png',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  androidStatusBar: {
    barStyle: 'light-content',
    backgroundColor: brandColor,
  },
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: brandColor,
  },
  updates: matchEnv({
    development: false,
    preview: true,
    staging: false,
    production: false,
  })
    ? {
        enabled: true,
        fallbackToCacheTimeout: 10 * 1000,
        url: 'https://u.expo.dev/3bb86839-e6c3-4a30-8246-440f8517683d',
      }
    : { enabled: false },
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
        preview: '.preview',
        development: '.development',
      }),
    adaptiveIcon: {
      backgroundColor: brandColor,
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
    intentFilters: [
      {
        autoVerify: true,
        action: 'VIEW',
        data: [{ mimeType: 'application/json' }],
        category: ['DEFAULT'],
      },
    ],
    permissions: ['com.google.android.gms.permission.AD_ID'],
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
    icon: './assets/ios-icon.png',
    infoPlist: {
      CFBundleAllowMixedLocalizations: true,
      CFBundleDocumentTypes: [
        {
          CFBundleTypeName: 'JSON File',
          LSItemContentTypes: ['public.json'],
          LSHandlerRank: 'Default',
        },
      ],
      LSSupportsOpeningDocumentsInPlace: true,
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  web: { favicon: './assets/favicon.png' },
  locales: {
    en: './languages/en.json',
    pt: './languages/pt.json',
  },
  extra: {
    envName,
    eas: { projectId: '3bb86839-e6c3-4a30-8246-440f8517683d' },
  },
  plugins: [
    ['expo-localization', { supportedLocales: ['en', 'pt'] }],
    [
      'react-native-google-mobile-ads',
      {
        androidAppId: 'ca-app-pub-7021594781994811~2254475974',
        iosAppId: 'ca-app-pub-7021594781994811~6911043889',
      },
    ],
  ],
})

// Helpers

const fatal = (reason: string): never => {
  throw new Error(reason)
}

const versionWithZeroPatch = (version: string) => {
  const parts = version.split('.')
  return parts.length === 3 && parts.every(p => p.match(/\d+/))
    ? `${parts[0]}.${parts[1]}.0`
    : fatal('invalid version string')
}

const APP_VARIANT: unknown = process.env.APP_VARIANT

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
