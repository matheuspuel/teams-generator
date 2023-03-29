import { defaultTheme } from './default'

export type AppTheme = typeof defaultTheme

export type AppThemeEnv = { theme: AppTheme }

export const Theme = {
  colors: {
    background: (env: AppThemeEnv) => env.theme.colors.background,
    text: {
      light: (env: AppThemeEnv) => env.theme.colors.text.light,
      dark: (env: AppThemeEnv) => env.theme.colors.text.dark,
      gray: (env: AppThemeEnv) => env.theme.colors.text.gray,
    },
    white: (env: AppThemeEnv) => env.theme.colors.white,
    black: (env: AppThemeEnv) => env.theme.colors.black,
    primary: {
      $1: (env: AppThemeEnv) => env.theme.colors.primary.$1,
      $2: (env: AppThemeEnv) => env.theme.colors.primary.$2,
      $3: (env: AppThemeEnv) => env.theme.colors.primary.$3,
      $4: (env: AppThemeEnv) => env.theme.colors.primary.$4,
      $5: (env: AppThemeEnv) => env.theme.colors.primary.$5,
      $6: (env: AppThemeEnv) => env.theme.colors.primary.$6,
      $7: (env: AppThemeEnv) => env.theme.colors.primary.$7,
      $8: (env: AppThemeEnv) => env.theme.colors.primary.$8,
      $9: (env: AppThemeEnv) => env.theme.colors.primary.$9,
    },
    danger: {
      $1: (env: AppThemeEnv) => env.theme.colors.danger.$1,
      $2: (env: AppThemeEnv) => env.theme.colors.danger.$2,
      $3: (env: AppThemeEnv) => env.theme.colors.danger.$3,
      $4: (env: AppThemeEnv) => env.theme.colors.danger.$4,
      $5: (env: AppThemeEnv) => env.theme.colors.danger.$5,
      $6: (env: AppThemeEnv) => env.theme.colors.danger.$6,
      $7: (env: AppThemeEnv) => env.theme.colors.danger.$7,
      $8: (env: AppThemeEnv) => env.theme.colors.danger.$8,
      $9: (env: AppThemeEnv) => env.theme.colors.danger.$9,
    },
    gray: {
      $1: (env: AppThemeEnv) => env.theme.colors.gray.$1,
      $2: (env: AppThemeEnv) => env.theme.colors.gray.$2,
      $3: (env: AppThemeEnv) => env.theme.colors.gray.$3,
      $4: (env: AppThemeEnv) => env.theme.colors.gray.$4,
      $5: (env: AppThemeEnv) => env.theme.colors.gray.$5,
      $6: (env: AppThemeEnv) => env.theme.colors.gray.$6,
      $7: (env: AppThemeEnv) => env.theme.colors.gray.$7,
      $8: (env: AppThemeEnv) => env.theme.colors.gray.$8,
      $9: (env: AppThemeEnv) => env.theme.colors.gray.$9,
    },
    yellow: {
      $1: (env: AppThemeEnv) => env.theme.colors.yellow.$1,
      $2: (env: AppThemeEnv) => env.theme.colors.yellow.$2,
      $3: (env: AppThemeEnv) => env.theme.colors.yellow.$3,
      $4: (env: AppThemeEnv) => env.theme.colors.yellow.$4,
      $5: (env: AppThemeEnv) => env.theme.colors.yellow.$5,
      $6: (env: AppThemeEnv) => env.theme.colors.yellow.$6,
      $7: (env: AppThemeEnv) => env.theme.colors.yellow.$7,
      $8: (env: AppThemeEnv) => env.theme.colors.yellow.$8,
      $9: (env: AppThemeEnv) => env.theme.colors.yellow.$9,
    },
  },
}

export const Colors = Theme.colors
