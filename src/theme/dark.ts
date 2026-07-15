import { Color } from 'src/utils/datatypes/Color'
import type { lightTheme } from './light'

export const darkTheme: typeof lightTheme = {
  type: 'dark',
  colors: {
    background: Color.hex('#090909'),
    card: Color.hex('#1d1d1d'),
    cardSecondary: Color.hex('#2d2d2d'),
    header: Color.hex('#354735'),
    text: {
      light: Color.hex('#efefef'),
      dark: Color.hex('#2f2f2f'),
      secondary: Color.hex('#a0a0a0'),
      gray: Color.hex('#3f3f3f'),
    },
    white: Color.hex('#ffffff'),
    black: Color.hex('#000000'),
    gray: Color.hex('#52525b'),
    primary: Color.hex('#327033'),
    success: Color.hex('#327033'),
    error: Color.hex('#db4e4e'),
  },
}
