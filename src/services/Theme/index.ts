import { Context, F } from 'src/utils/fp'
import { defaultTheme } from './default'

type AppTheme_ = typeof defaultTheme

export interface AppTheme extends AppTheme_ {}

export const AppThemeEnv = Context.Tag<AppTheme>()

export const Theme = {
  colors: {
    background: F.map(AppThemeEnv, env => env.colors.background),
    text: {
      light: F.map(AppThemeEnv, env => env.colors.text.light),
      dark: F.map(AppThemeEnv, env => env.colors.text.dark),
      gray: F.map(AppThemeEnv, env => env.colors.text.gray),
    },
    white: F.map(AppThemeEnv, env => env.colors.white),
    black: F.map(AppThemeEnv, env => env.colors.black),
    primary: {
      $1: F.map(AppThemeEnv, env => env.colors.primary.$1),
      $2: F.map(AppThemeEnv, env => env.colors.primary.$2),
      $3: F.map(AppThemeEnv, env => env.colors.primary.$3),
      $4: F.map(AppThemeEnv, env => env.colors.primary.$4),
      $5: F.map(AppThemeEnv, env => env.colors.primary.$5),
      $6: F.map(AppThemeEnv, env => env.colors.primary.$6),
      $7: F.map(AppThemeEnv, env => env.colors.primary.$7),
      $8: F.map(AppThemeEnv, env => env.colors.primary.$8),
      $9: F.map(AppThemeEnv, env => env.colors.primary.$9),
    },
    danger: {
      $1: F.map(AppThemeEnv, env => env.colors.danger.$1),
      $2: F.map(AppThemeEnv, env => env.colors.danger.$2),
      $3: F.map(AppThemeEnv, env => env.colors.danger.$3),
      $4: F.map(AppThemeEnv, env => env.colors.danger.$4),
      $5: F.map(AppThemeEnv, env => env.colors.danger.$5),
      $6: F.map(AppThemeEnv, env => env.colors.danger.$6),
      $7: F.map(AppThemeEnv, env => env.colors.danger.$7),
      $8: F.map(AppThemeEnv, env => env.colors.danger.$8),
      $9: F.map(AppThemeEnv, env => env.colors.danger.$9),
    },
    gray: {
      $1: F.map(AppThemeEnv, env => env.colors.gray.$1),
      $2: F.map(AppThemeEnv, env => env.colors.gray.$2),
      $3: F.map(AppThemeEnv, env => env.colors.gray.$3),
      $4: F.map(AppThemeEnv, env => env.colors.gray.$4),
      $5: F.map(AppThemeEnv, env => env.colors.gray.$5),
      $6: F.map(AppThemeEnv, env => env.colors.gray.$6),
      $7: F.map(AppThemeEnv, env => env.colors.gray.$7),
      $8: F.map(AppThemeEnv, env => env.colors.gray.$8),
      $9: F.map(AppThemeEnv, env => env.colors.gray.$9),
    },
    yellow: {
      $1: F.map(AppThemeEnv, env => env.colors.yellow.$1),
      $2: F.map(AppThemeEnv, env => env.colors.yellow.$2),
      $3: F.map(AppThemeEnv, env => env.colors.yellow.$3),
      $4: F.map(AppThemeEnv, env => env.colors.yellow.$4),
      $5: F.map(AppThemeEnv, env => env.colors.yellow.$5),
      $6: F.map(AppThemeEnv, env => env.colors.yellow.$6),
      $7: F.map(AppThemeEnv, env => env.colors.yellow.$7),
      $8: F.map(AppThemeEnv, env => env.colors.yellow.$8),
      $9: F.map(AppThemeEnv, env => env.colors.yellow.$9),
    },
  },
}

export const Colors = Theme.colors
