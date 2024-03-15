import { UIColor } from 'src/components/types'
import { Color } from 'src/utils/datatypes'
import { withOpacity } from 'src/utils/datatypes/Color'
import { Context, Effect, F, absurd } from 'src/utils/fp'
import { lightTheme } from './light'

type AppTheme_ = typeof lightTheme

export interface AppTheme extends AppTheme_ {}

export class AppThemeEnv extends Context.Tag('AppTheme')<
  AppThemeEnv,
  AppTheme
>() {}

const matchType = <A>(cases: {
  light: Effect<A, never, AppThemeEnv>
  dark: Effect<A, never, AppThemeEnv>
}): Effect<A, never, AppThemeEnv> =>
  F.flatMap(AppThemeEnv, t =>
    t.type === 'light'
      ? cases.light
      : t.type === 'dark'
        ? cases.dark
        : absurd<never>(t.type),
  )

export const Theme = {
  type: (t: AppTheme) => t.type,
  matchType,
  colors: {
    opacity: (factor: number): ((color: UIColor) => UIColor) =>
      F.map(withOpacity(Math.round(factor * 255))),
    toneStatic: (factor: number): ((color: UIColor) => UIColor) =>
      F.map(
        factor > 0 ? Color.tone(0)(factor) : Color.tone(255)(Math.abs(factor)),
      ),
    tone:
      (factor: number): ((color: UIColor) => UIColor) =>
      c =>
        matchType({
          light: F.map(
            c,
            factor > 0
              ? Color.tone(0)(factor)
              : Color.tone(255)(Math.abs(factor)),
          ),
          dark: F.map(
            c,
            factor > 0
              ? Color.tone(255)(factor)
              : Color.tone(0)(Math.abs(factor)),
          ),
        }),
    background: F.map(AppThemeEnv, env => env.colors.background),
    card: F.map(AppThemeEnv, env => env.colors.card),
    cardSecondary: F.map(AppThemeEnv, env => env.colors.cardSecondary),
    header: F.map(AppThemeEnv, env => env.colors.header),
    text: {
      light: F.map(AppThemeEnv, env => env.colors.text.light),
      dark: F.map(AppThemeEnv, env => env.colors.text.dark),
      secondary: F.map(AppThemeEnv, env => env.colors.text.secondary),
      gray: F.map(AppThemeEnv, env => env.colors.text.gray),
      normal: matchType({
        light: F.map(AppThemeEnv, env => env.colors.text.dark),
        dark: F.map(AppThemeEnv, env => env.colors.text.light),
      }),
      inverted: matchType({
        light: F.map(AppThemeEnv, env => env.colors.text.light),
        dark: F.map(AppThemeEnv, env => env.colors.text.dark),
      }),
    },
    white: F.map(AppThemeEnv, env => env.colors.white),
    black: F.map(AppThemeEnv, env => env.colors.black),
    gray: F.map(AppThemeEnv, env => env.colors.gray),
    primary: F.map(AppThemeEnv, env => env.colors.primary),
    success: F.map(AppThemeEnv, env => env.colors.success),
    error: F.map(AppThemeEnv, env => env.colors.error),
  },
}

export const Colors = Theme.colors
