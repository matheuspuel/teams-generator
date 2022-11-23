/* eslint-disable @typescript-eslint/no-explicit-any */
import { extendTheme, INativebaseConfig, Theme } from 'native-base'

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? DeepPartial<U>[]
    : T[P] extends readonly (infer U)[]
    ? readonly DeepPartial<U>[]
    : DeepPartial<T[P]> | T[P]
}

const customExtendTheme = <T extends DeepPartial<Theme>>(value: T) =>
  extendTheme(value)
// extendTheme(value) as ITheme & T

export const theme = customExtendTheme({
  colors: {
    primary: {
      50: '#D0E6FA',
      100: '#A1CDF5',
      200: '#71B5EF',
      300: '#429CEA',
      400: '#1982DF',
      500: '#1467B0',
      600: '#0E4A80',
      700: '#0B3860',
      800: '#072640',
      900: '#041320',
    },
    lightText: '#FFFFFF',
    darkText: '#1E1E1E',
    grayText: '#606060',
    background: '#F2F2F2',
  },
  components: {
    Text: { baseStyle: { _light: { color: 'darkText' } } },
    Heading: { baseStyle: { _light: { color: 'darkText' } } },
    Select: { baseStyle: { fontSize: 'md' } },
  },
})

export const nbConfig: INativebaseConfig = {
  suppressColorAccessibilityWarning: true,
}

type CustomTheme = typeof theme

declare module 'native-base' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface ICustomTheme extends CustomTheme {}
}
