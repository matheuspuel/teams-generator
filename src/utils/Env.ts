import Constants from 'expo-constants'

const envName_: unknown = Constants.manifest?.extra?.envName

export const envName = (() => {
  switch (envName_) {
    case 'production':
    case 'staging':
    case 'preview':
    case 'development':
      return envName_
    default:
      throw new Error('Unknown app environment')
  }
})()

export const matchEnv = <D, PW, S, P>(cases: {
  development: D
  preview: PW
  staging: S
  production: P
}) => cases[envName]
