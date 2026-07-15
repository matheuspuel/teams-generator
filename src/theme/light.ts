import { Color } from 'src/utils/datatypes/Color'

export const lightTheme = {
  type: 'light' as 'dark' | 'light',
  colors: {
    background: Color.hex('#f2f2f2'),
    card: Color.hex('#ffffff'),
    cardSecondary: Color.hex('#ffffff'),
    header: Color.hex('#136d15'),
    text: {
      light: Color.hex('#ffffff'),
      dark: Color.hex('#2f2f2f'),
      secondary: Color.hex('#5f5f5f'),
      gray: Color.hex('#a0a0a0'),
    },
    white: Color.hex('#ffffff'),
    black: Color.hex('#000000'),
    gray: Color.hex('#52525b'),
    primary: Color.hex('#136d15'),
    success: Color.hex('#136d15'),
    error: Color.hex('#dc2626'),
  },
}
