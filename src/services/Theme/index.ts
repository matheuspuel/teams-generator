import { Context, Effect, absurd } from 'effect'
import { UIColor } from 'src/components/types'
import { Color } from 'src/utils/datatypes'
import { withOpacity } from 'src/utils/datatypes/Color'
import { lightTheme } from './light'

type AppTheme_ = typeof lightTheme

export interface AppTheme extends AppTheme_ {}

export class AppThemeEnv extends Context.Tag('AppTheme')<
  AppThemeEnv,
  AppTheme
>() {}

const matchType = <A>(cases: {
  light: Effect.Effect<A, never, AppThemeEnv>
  dark: Effect.Effect<A, never, AppThemeEnv>
}): Effect.Effect<A, never, AppThemeEnv> =>
  Effect.flatMap(AppThemeEnv, t =>
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
      Effect.map(withOpacity(Math.round(factor * 255))),
    toneStatic: (factor: number): ((color: UIColor) => UIColor) =>
      Effect.map(
        factor > 0 ? Color.tone(0)(factor) : Color.tone(255)(Math.abs(factor)),
      ),
    tone:
      (factor: number): ((color: UIColor) => UIColor) =>
      c =>
        matchType({
          light: Effect.map(
            c,
            factor > 0
              ? Color.tone(0)(factor)
              : Color.tone(255)(Math.abs(factor)),
          ),
          dark: Effect.map(
            c,
            factor > 0
              ? Color.tone(255)(factor)
              : Color.tone(0)(Math.abs(factor)),
          ),
        }),
    background: Effect.map(AppThemeEnv, env => env.colors.background),
    card: Effect.map(AppThemeEnv, env => env.colors.card),
    cardSecondary: Effect.map(AppThemeEnv, env => env.colors.cardSecondary),
    header: Effect.map(AppThemeEnv, env => env.colors.header),
    text: {
      light: Effect.map(AppThemeEnv, env => env.colors.text.light),
      dark: Effect.map(AppThemeEnv, env => env.colors.text.dark),
      secondary: Effect.map(AppThemeEnv, env => env.colors.text.secondary),
      gray: Effect.map(AppThemeEnv, env => env.colors.text.gray),
      normal: matchType({
        light: Effect.map(AppThemeEnv, env => env.colors.text.dark),
        dark: Effect.map(AppThemeEnv, env => env.colors.text.light),
      }),
      inverted: matchType({
        light: Effect.map(AppThemeEnv, env => env.colors.text.light),
        dark: Effect.map(AppThemeEnv, env => env.colors.text.dark),
      }),
    },
    white: Effect.map(AppThemeEnv, env => env.colors.white),
    black: Effect.map(AppThemeEnv, env => env.colors.black),
    gray: Effect.map(AppThemeEnv, env => env.colors.gray),
    primary: Effect.map(AppThemeEnv, env => env.colors.primary),
    success: Effect.map(AppThemeEnv, env => env.colors.success),
    error: Effect.map(AppThemeEnv, env => env.colors.error),
  },
}

export const Colors = Theme.colors
