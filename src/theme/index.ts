import type { Color } from 'src/utils/datatypes/Color'
import type { lightTheme } from './light'

type ThemeDefinition = typeof lightTheme

export type Theme = ReturnType<typeof makeTheme>

export const makeTheme = (theme: ThemeDefinition) => {
  const matchType = <A>(cases: { light: A; dark: A }): A => cases[theme.type]
  return {
    type: theme.type,
    matchType,
    colors: {
      ...theme.colors,
      text: {
        ...theme.colors.text,
        normal: matchType({
          light: theme.colors.text.dark,
          dark: theme.colors.text.light,
        }),
        inverted: matchType({
          light: theme.colors.text.light,
          dark: theme.colors.text.dark,
        }),
      },
      toneStatic: (factor: number) => (color: Color) =>
        factor > 0 ? color.tone(0, factor) : color.tone(255, Math.abs(factor)),
      tone: (factor: number) => (color: Color) =>
        matchType({
          light:
            factor > 0
              ? color.tone(0, factor)
              : color.tone(255, Math.abs(factor)),
          dark:
            factor > 0
              ? color.tone(255, factor)
              : color.tone(0, Math.abs(factor)),
        }),
    },
  }
}
