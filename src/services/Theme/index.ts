import { Context, Effect, absurd } from 'effect'
import { UIColor } from 'src/components/types'
import { Color } from 'src/utils/datatypes'
import { withOpacity } from 'src/utils/datatypes/Color'
import type { lightTheme } from './light'

type AppTheme_ = typeof lightTheme

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ThemeImplementation extends AppTheme_ {}

export class Theme extends Context.Tag('Theme')<Theme, ThemeImplementation>() {
  static type = Effect.map(Theme, _ => _.type)
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
    background: Effect.map(Theme, _ => _.colors.background),
    card: Effect.map(Theme, _ => _.colors.card),
    cardSecondary: Effect.map(Theme, _ => _.colors.cardSecondary),
    header: Effect.map(Theme, _ => _.colors.header),
    text: {
      light: Effect.map(Theme, _ => _.colors.text.light),
      dark: Effect.map(Theme, _ => _.colors.text.dark),
      secondary: Effect.map(Theme, _ => _.colors.text.secondary),
      gray: Effect.map(Theme, _ => _.colors.text.gray),
      normal: Theme.matchType({
        light: Effect.map(Theme, _ => _.colors.text.dark),
        dark: Effect.map(Theme, _ => _.colors.text.light),
      }),
      inverted: Theme.matchType({
        light: Effect.map(Theme, _ => _.colors.text.light),
        dark: Effect.map(Theme, _ => _.colors.text.dark),
      }),
    },
    white: Effect.map(Theme, _ => _.colors.white),
    black: Effect.map(Theme, _ => _.colors.black),
    gray: Effect.map(Theme, _ => _.colors.gray),
    primary: Effect.map(Theme, _ => _.colors.primary),
    success: Effect.map(Theme, _ => _.colors.success),
    error: Effect.map(Theme, _ => _.colors.error),
  }
}

export const Colors = Theme.colors
