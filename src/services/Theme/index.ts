import { Context } from 'src/utils/fp'
import { UIEnv } from '../UI'
import { defaultTheme } from './default'

type AppTheme_ = typeof defaultTheme

export interface AppTheme extends AppTheme_ {}

export const AppThemeEnv = Context.Tag<AppTheme>()

export const Theme = {
  colors: {
    background: (env: UIEnv) => env.Theme.colors.background,
    text: {
      light: (env: UIEnv) => env.Theme.colors.text.light,
      dark: (env: UIEnv) => env.Theme.colors.text.dark,
      gray: (env: UIEnv) => env.Theme.colors.text.gray,
    },
    white: (env: UIEnv) => env.Theme.colors.white,
    black: (env: UIEnv) => env.Theme.colors.black,
    primary: {
      $1: (env: UIEnv) => env.Theme.colors.primary.$1,
      $2: (env: UIEnv) => env.Theme.colors.primary.$2,
      $3: (env: UIEnv) => env.Theme.colors.primary.$3,
      $4: (env: UIEnv) => env.Theme.colors.primary.$4,
      $5: (env: UIEnv) => env.Theme.colors.primary.$5,
      $6: (env: UIEnv) => env.Theme.colors.primary.$6,
      $7: (env: UIEnv) => env.Theme.colors.primary.$7,
      $8: (env: UIEnv) => env.Theme.colors.primary.$8,
      $9: (env: UIEnv) => env.Theme.colors.primary.$9,
    },
    danger: {
      $1: (env: UIEnv) => env.Theme.colors.danger.$1,
      $2: (env: UIEnv) => env.Theme.colors.danger.$2,
      $3: (env: UIEnv) => env.Theme.colors.danger.$3,
      $4: (env: UIEnv) => env.Theme.colors.danger.$4,
      $5: (env: UIEnv) => env.Theme.colors.danger.$5,
      $6: (env: UIEnv) => env.Theme.colors.danger.$6,
      $7: (env: UIEnv) => env.Theme.colors.danger.$7,
      $8: (env: UIEnv) => env.Theme.colors.danger.$8,
      $9: (env: UIEnv) => env.Theme.colors.danger.$9,
    },
    gray: {
      $1: (env: UIEnv) => env.Theme.colors.gray.$1,
      $2: (env: UIEnv) => env.Theme.colors.gray.$2,
      $3: (env: UIEnv) => env.Theme.colors.gray.$3,
      $4: (env: UIEnv) => env.Theme.colors.gray.$4,
      $5: (env: UIEnv) => env.Theme.colors.gray.$5,
      $6: (env: UIEnv) => env.Theme.colors.gray.$6,
      $7: (env: UIEnv) => env.Theme.colors.gray.$7,
      $8: (env: UIEnv) => env.Theme.colors.gray.$8,
      $9: (env: UIEnv) => env.Theme.colors.gray.$9,
    },
    yellow: {
      $1: (env: UIEnv) => env.Theme.colors.yellow.$1,
      $2: (env: UIEnv) => env.Theme.colors.yellow.$2,
      $3: (env: UIEnv) => env.Theme.colors.yellow.$3,
      $4: (env: UIEnv) => env.Theme.colors.yellow.$4,
      $5: (env: UIEnv) => env.Theme.colors.yellow.$5,
      $6: (env: UIEnv) => env.Theme.colors.yellow.$6,
      $7: (env: UIEnv) => env.Theme.colors.yellow.$7,
      $8: (env: UIEnv) => env.Theme.colors.yellow.$8,
      $9: (env: UIEnv) => env.Theme.colors.yellow.$9,
    },
  },
}

export const Colors = Theme.colors
