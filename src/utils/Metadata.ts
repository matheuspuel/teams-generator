import ExpoConstants from 'expo-constants'
import packageJSON from 'src/../package.json'
import { fatal } from './Error'

const envName_: unknown = ExpoConstants.expoConfig?.extra?.envName

export const envName =
  envName_ === 'production'
    ? envName_
    : envName_ === 'staging'
      ? envName_
      : envName_ === 'preview'
        ? envName_
        : envName_ === 'development'
          ? envName_
          : fatal('Unknown app environment: ' + String(envName_))

export const matchEnv = <D, PW, S, P>(cases: {
  development: D
  preview: PW
  staging: S
  production: P
}) => cases[envName]

export const appVersion = packageJSON.version

export const appVersionName =
  'v' +
  appVersion +
  matchEnv({
    production: '',
    staging: ' (STAGING)',
    preview: ' (PREVIEW)',
    development: ' (DEV)',
  })

export const storeUrls = {
  android:
    'https://play.google.com/store/apps/details?id=dev.matheuspuel.sorteiotimes',
  ios: 'https://apps.apple.com/pl/app/teams-generator/id6476064177',
}
