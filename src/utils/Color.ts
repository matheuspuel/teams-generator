import { Endomorphism } from 'fp'

export type Byte = number

export type Color = {
  red: Byte
  green: Byte
  blue: Byte
  opacity: Byte
}

export type SolidColor = Color & { opacity: 255 }

export const color = (red: Byte, green: Byte, blue: Byte): SolidColor => ({
  red,
  green,
  blue,
  opacity: 255,
})

export const colorAndOpacity = (
  red: Byte,
  green: Byte,
  blue: Byte,
  opacity: Byte,
): Color => ({ red, green, blue, opacity })

export const withOpacity =
  (opacity: Byte) =>
  (color: Color): Color => ({ ...color, opacity })

export const mapColorBytes: (
  f: Endomorphism<Byte>,
) => (originalColor: Color) => Color = f => originalColor => ({
  red: f(originalColor.red),
  green: f(originalColor.green),
  blue: f(originalColor.blue),
  opacity: originalColor.opacity,
})

const byteToHex = (byte: Byte): string => byte.toString(16).padStart(2, '0')

export const toHex = (color: Color): string =>
  '#' +
  byteToHex(color.red) +
  byteToHex(color.green) +
  byteToHex(color.blue) +
  byteToHex(color.opacity)

const toneByte =
  (whiteLevel: Byte) =>
  (factor: number) =>
  (from: Byte): Byte =>
    Math.round((whiteLevel - from) * factor + from)

export const tone = (whiteLevel: Byte) => (factor: number) =>
  mapColorBytes(toneByte(whiteLevel)(factor))

export const tint = tone(255)

export const shade = tone(0)

export type Palette = {
  $1: Color
  $2: Color
  $3: Color
  $4: Color
  $5: Color
  $6: Color
  $7: Color
  $8: Color
  $9: Color
}

export const palette = (baseColor: SolidColor): Palette => ({
  $1: tint(0.8)(baseColor),
  $2: tint((1 + 0.8) ** (3 / 4) - 1)(baseColor),
  $3: tint((1 + 0.8) ** (2 / 4) - 1)(baseColor),
  $4: tint((1 + 0.8) ** (1 / 4) - 1)(baseColor),
  $5: baseColor,
  $6: shade((1 + 0.8) ** (1 / 4) - 1)(baseColor),
  $7: shade((1 + 0.8) ** (2 / 4) - 1)(baseColor),
  $8: shade((1 + 0.8) ** (3 / 4) - 1)(baseColor),
  $9: shade(0.8)(baseColor),
})
