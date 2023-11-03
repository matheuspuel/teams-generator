import { Color } from 'src/utils/datatypes'
import { S } from 'src/utils/fp'
import { lightTheme } from './light'

const hex = S.decodeSync(Color.FromHex)

export const darkTheme: typeof lightTheme = {
  type: 'dark',
  colors: {
    background: hex('#090909'),
    card: hex('#1d1d1d'),
    cardSecondary: hex('#2d2d2d'),
    header: hex('#354735'),
    text: {
      light: hex('#efefef'),
      dark: hex('#2f2f2f'),
      secondary: hex('#a0a0a0'),
      gray: hex('#3f3f3f'),
    },
    white: hex('#ffffff'),
    black: hex('#000000'),
    gray: hex('#52525b'),
    primary: hex('#327033'),
    success: hex('#327033'),
    error: hex('#db4e4e'),
  },
}
