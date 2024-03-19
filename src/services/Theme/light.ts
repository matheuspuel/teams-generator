import { Schema } from '@effect/schema'
import { Color } from 'src/utils/datatypes'

const hex = Schema.decodeSync(Color.FromHex)

export const lightTheme = {
  type: 'light' as 'dark' | 'light',
  colors: {
    background: hex('#f2f2f2'),
    card: hex('#ffffff'),
    cardSecondary: hex('#ffffff'),
    header: hex('#136d15'),
    text: {
      light: hex('#ffffff'),
      dark: hex('#2f2f2f'),
      secondary: hex('#5f5f5f'),
      gray: hex('#a0a0a0'),
    },
    white: hex('#ffffff'),
    black: hex('#000000'),
    gray: hex('#52525b'),
    primary: hex('#136d15'),
    success: hex('#136d15'),
    error: hex('#dc2626'),
  },
}
