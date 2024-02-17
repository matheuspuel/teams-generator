import Constants from 'expo-constants'
import packageJSON from 'src/../package.json'
import { fatal } from './Error'
import { String } from './fp'

const envName_: unknown = Constants.expoConfig?.extra?.envName

export const envName =
  envName_ === 'production'
    ? envName_
    : envName_ === 'staging'
      ? envName_
      : envName_ === 'preview'
        ? envName_
        : envName_ === 'development'
          ? envName_
          : fatal('Unknown app environment: ' + String.Class(envName_))

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
