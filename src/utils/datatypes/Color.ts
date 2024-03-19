import { ParseResult, Schema } from '@effect/schema'
import { Option, String, flow, identity, pipe } from 'effect'
import { apply } from 'effect/Function'

type Endomorphism<A> = (_: A) => A

export type Byte = number

export type Color = {
  red: Byte
  green: Byte
  blue: Byte
  opacity: Byte
}

export const Color = Schema.struct({
  red: Schema.number,
  green: Schema.number,
  blue: Schema.number,
  opacity: Schema.number,
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

const parseChar = (v: string): Option.Option<number> =>
  pipe(
    v.charCodeAt(0),
    n => (n >= 97 ? n - 97 + 10 : n >= 65 ? n - 65 + 10 : n - 48),
    Option.liftPredicate(n => 0 <= n && n <= 15),
  )

const parseByte = (v: string): Option.Option<Byte> =>
  pipe(
    Option.fromNullable(v[0]),
    Option.flatMap(parseChar),
    Option.flatMap(a =>
      pipe(
        Option.fromNullable(v[1]),
        Option.flatMap(parseChar),
        Option.map(b => a * 16 + b),
      ),
    ),
  )

export const FromHex: Schema.Schema<Color, string> = Schema.transformOrFail(
  Schema.string,
  Color,
  (v: string) =>
    !v.startsWith('#')
      ? ParseResult.fail(new ParseResult.Type(Color.ast, v))
      : pipe(
          Option.all([
            parseByte(String.slice(1, 3)(v)),
            parseByte(String.slice(3, 5)(v)),
            parseByte(String.slice(5, 7)(v)),
          ]),
          Option.map(([r, g, b]) => color(r, g, b)),
          Option.map(c =>
            pipe(
              parseByte(String.slice(7, 9)(v)),
              Option.match({
                onNone: () => identity<Color>,
                onSome: withOpacity,
              }),
              apply(c),
            ),
          ),
          Option.match({
            onNone: () => ParseResult.fail(new ParseResult.Type(Color.ast, v)),
            onSome: ParseResult.succeed,
          }),
        ),
  flow(toHex, ParseResult.succeed),
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
