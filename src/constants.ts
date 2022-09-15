import packageJSON from 'src/../package.json'
import { matchEnv } from './utils/Env'

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
