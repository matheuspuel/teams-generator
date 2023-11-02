import { Color } from 'src/utils/datatypes'
import { S } from 'src/utils/fp'

const hex = S.decodeSync(Color.FromHex)

export const lightTheme = {
  type: 'light' as 'dark' | 'light',
  colors: {
    background: hex('#f2f2f2'),
    card: hex('#ffffff'),
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
    error: hex('#dc2626'),
    yellow: hex('#eab308'),
  },
}
