import { Context, Effect, absurd } from 'effect'
import { UIColor } from 'src/components/types'
import { Color } from 'src/utils/datatypes'
import { withOpacity } from 'src/utils/datatypes/Color'
import { lightTheme } from './light'

type AppTheme_ = typeof lightTheme

export interface ThemeImplementation extends AppTheme_ {}

export class Theme extends Context.Tag('Theme')<Theme, ThemeImplementation>() {
  static type = Effect.map(Theme, env => env.type)
  static matchType = <A>(cases: {
    light: Effect.Effect<A, never, Theme>
    dark: Effect.Effect<A, never, Theme>
  }): Effect.Effect<A, never, Theme> =>
    Effect.flatMap(Theme, t =>
      t.type === 'light'
        ? cases.light
        : t.type === 'dark'
          ? cases.dark
          : absurd<never>(t.type),
    )
  static colors = {
    opacity: (factor: number): ((color: UIColor) => UIColor) =>
      Effect.map(withOpacity(Math.round(factor * 255))),
    toneStatic: (factor: number): ((color: UIColor) => UIColor) =>
      Effect.map(
        factor > 0 ? Color.tone(0)(factor) : Color.tone(255)(Math.abs(factor)),
      ),
    tone:
      (factor: number): ((color: UIColor) => UIColor) =>
      c =>
        Theme.matchType({
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
    background: Effect.map(Theme, env => env.colors.background),
    card: Effect.map(Theme, env => env.colors.card),
    cardSecondary: Effect.map(Theme, env => env.colors.cardSecondary),
    header: Effect.map(Theme, env => env.colors.header),
    text: {
      light: Effect.map(Theme, env => env.colors.text.light),
      dark: Effect.map(Theme, env => env.colors.text.dark),
      secondary: Effect.map(Theme, env => env.colors.text.secondary),
      gray: Effect.map(Theme, env => env.colors.text.gray),
      normal: Theme.matchType({
        light: Effect.map(Theme, env => env.colors.text.dark),
        dark: Effect.map(Theme, env => env.colors.text.light),
      }),
      inverted: Theme.matchType({
        light: Effect.map(Theme, env => env.colors.text.light),
        dark: Effect.map(Theme, env => env.colors.text.dark),
      }),
    },
    white: Effect.map(Theme, env => env.colors.white),
    black: Effect.map(Theme, env => env.colors.black),
    gray: Effect.map(Theme, env => env.colors.gray),
    primary: Effect.map(Theme, env => env.colors.primary),
    success: Effect.map(Theme, env => env.colors.success),
    error: Effect.map(Theme, env => env.colors.error),
  }
}

export const Colors = Theme.colors
