import { ParseResult, Schema, String, pipe } from 'effect'

export type Byte = Schema.Schema.Type<typeof Byte>
const Byte = Schema.Number

export class Color extends Schema.Class<Color>('Color')({
  red: Byte,
  green: Byte,
  blue: Byte,
  opacity: Byte,
}) {
  static FromHex: Schema.Schema<Color, string> = Schema.transformOrFail(
    Schema.String,
    Schema.typeSchema(Color),
    {
      decode: (v: string) => {
        const result = (() => {
          if (!v.startsWith('#')) return null
          const r = parseByte(String.slice(1, 3)(v))
          const g = parseByte(String.slice(3, 5)(v))
          const b = parseByte(String.slice(5, 7)(v))
          if (r === null || g === null || b === null) return null
          const solid = Color.rgb(r, g, b)
          if (solid === null) return null
          const opacity = parseByte(String.slice(7, 9)(v))
          return opacity === null ? solid : solid.setOpacity(opacity)
        })()
        return result === null
          ? ParseResult.fail(new ParseResult.Type(Color.ast, v))
          : ParseResult.succeed(result)
      },
      encode: _ => ParseResult.succeed(_.toHex()),
    },
  )

  static hex(value: string) {
    return Schema.decodeSync(Color.FromHex)(value)
  }

  static rgb(red: Byte, green: Byte, blue: Byte, opacity?: Byte): Color {
    return Color.make({ red, green, blue, opacity: opacity ?? 255 })
  }

  static buildPaletteFor(base: Color): Palette {
    return {
      $1: base.tint(0.8),
      $2: base.tint((1 + 0.8) ** (3 / 4) - 1),
      $3: base.tint((1 + 0.8) ** (2 / 4) - 1),
      $4: base.tint((1 + 0.8) ** (1 / 4) - 1),
      $5: base,
      $6: base.shade((1 + 0.8) ** (1 / 4) - 1),
      $7: base.shade((1 + 0.8) ** (2 / 4) - 1),
      $8: base.shade((1 + 0.8) ** (3 / 4) - 1),
      $9: base.shade(0.8),
    }
  }

  toHex(): string {
    return (
      '#' +
      byteToHex(this.red) +
      byteToHex(this.green) +
      byteToHex(this.blue) +
      byteToHex(this.opacity)
    )
  }

  toString(): string {
    return this.toHex()
  }

  setOpacity(opacity: Byte): Color {
    return Color.make({ ...this, opacity })
  }

  setOpacityFactor(factor: number): Color {
    return Color.make({ ...this, opacity: Math.round(factor * 255) })
  }

  mapColorBytes(f: (byte: Byte) => Byte): Color {
    return Color.make({
      red: f(this.red),
      green: f(this.green),
      blue: f(this.blue),
      opacity: this.opacity,
    })
  }

  tone(whiteLevel: Byte, factor: number) {
    return this.mapColorBytes(toneByte(whiteLevel)(factor))
  }

  tint(factor: number) {
    return this.tone(255, factor)
  }

  shade(factor: number) {
    return this.tone(0, factor)
  }
}

const byteToHex = (byte: Byte): string => byte.toString(16).padStart(2, '0')

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

const toneByte =
  (whiteLevel: Byte) =>
  (factor: number) =>
  (from: Byte): Byte =>
    Math.round((whiteLevel - from) * factor + from)

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
