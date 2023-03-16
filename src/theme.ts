import { color, palette } from 'src/utils/datatypes/Color'

export const theme = {
  colors: {
    background: color(242, 242, 242),
    text: {
      light: color(255, 255, 255),
      dark: color(30, 30, 30),
      gray: color(96, 96, 96),
    },
    white: color(255, 255, 255),
    black: color(0, 0, 0),
    primary: palette(color(19, 109, 21)),
    danger: palette(color(244, 63, 94)),
    gray: palette(color(82, 82, 91)),
    yellow: palette(color(234, 179, 8)),
  },
}

export const colors = theme.colors
