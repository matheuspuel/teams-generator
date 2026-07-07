import { ParseResult, Schema, String, flow, pipe } from 'effect'

type Endomorphism<A> = (_: A) => A

export type Byte = Schema.Schema.Type<typeof Byte>
const Byte = Schema.Number

export type Color = Schema.Schema.Type<typeof Color>
export const Color = Schema.Struct({
  red: Byte,
  green: Byte,
  blue: Byte,
  opacity: Byte,
})

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

const parseChar = (v: string): number | null =>
  pipe(
    v.charCodeAt(0),
    n => (n >= 97 ? n - 97 + 10 : n >= 65 ? n - 65 + 10 : n - 48),
    n => (0 <= n && n <= 15 ? n : null),
  )

const parseByte = (v: string): Byte | null => {
  if (v[0] === undefined || v[1] === undefined) return null
  const a = parseChar(v[0])
  if (a === null) return null
  const b = parseChar(v[1])
  if (b === null) return null
  return a * 16 + b
}

export const FromHex: Schema.Schema<Color, string> = Schema.transformOrFail(
  Schema.String,
  Color,
  {
    decode: (v: string) => {
      const result = (() => {
        if (!v.startsWith('#')) return null
        const r = parseByte(String.slice(1, 3)(v))
        const g = parseByte(String.slice(3, 5)(v))
        const b = parseByte(String.slice(5, 7)(v))
        if (r === null || g === null || b === null) return null
        const solid = color(r, g, b)
        if (solid === null) return null
        const opacity = parseByte(String.slice(7, 9)(v))
        return opacity === null ? solid : withOpacity(opacity)(solid)
      })()
      return result === null
        ? ParseResult.fail(new ParseResult.Type(Color.ast, v))
        : ParseResult.succeed(result)
    },
    encode: flow(toHex, ParseResult.succeed),
  },
)

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

export const palette = (baseColor: Color): Palette => ({
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
