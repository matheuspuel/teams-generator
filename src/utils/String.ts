import { pipe } from 'fp-ts/lib/function'
import { Branded } from 'io-ts'
import {
  compose,
  Decoder,
  fromRefinement,
  id,
  intersect,
  refine,
  string,
} from 'io-ts/Decoder'
import { fatal } from './Error'

export type NonEmptyString = Branded<string, NonEmptyStringBrand>
type NonEmptyStringBrand = { readonly NonEmptyString: unique symbol }
export namespace NonEmptyString {
  const stringIs = (v: string): v is NonEmptyString => v.length > 0

  export const FromString = fromRefinement(stringIs, 'NonEmptyString')

  export const Decoder = pipe(string, compose(FromString))

  export const of = <S extends string>(
    s: S extends ''
      ? never
      : string extends S
      ? never
      : // eslint-disable-next-line @typescript-eslint/no-explicit-any
      S extends Record<any, any>
      ? S extends NonEmptyString
        ? S
        : never
      : S,
  ): S & NonEmptyString =>
    stringIs(s)
      ? s
      : fatal(
          'Called `NonEmptyString.of` function with an empty string, which should not be possible',
        )
}

export type Slug = Branded<NonEmptyString, SlugBrand>
type SlugBrand = { readonly Slug: unique symbol }
export namespace Slug {
  const nonEmptyStringIs = (v: NonEmptyString): v is Slug => true

  export const FromString = pipe(
    NonEmptyString.FromString,
    refine(nonEmptyStringIs, 'Slug'),
  )

  export const Decoder = pipe(string, compose(FromString))
}

export type Email = Branded<NonEmptyString, EmailBrand>
type EmailBrand = { readonly Email: unique symbol }
export namespace Email {
  const nonEmptyStringIs = (v: NonEmptyString): v is Email =>
    /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(v)

  export const FromNonEmptyString = fromRefinement(nonEmptyStringIs, 'Email')

  export const FromString = pipe(
    NonEmptyString.FromString,
    compose(FromNonEmptyString),
  )

  export const Decoder = pipe(string, compose(FromString))
}

export type PhoneNumber = Branded<NonEmptyString, PhoneNumberBrand>
type PhoneNumberBrand = { readonly PhoneNumber: unique symbol }
export namespace PhoneNumber {
  const nonEmptyStringIs = (v: NonEmptyString): v is PhoneNumber => true

  export const FromString = pipe(
    NonEmptyString.FromString,
    refine(nonEmptyStringIs, 'PhoneNumber'),
  )

  export const Decoder = pipe(string, compose(FromString))
}

export type Digits = Branded<string, DigitsBrand>
type DigitsBrand = { readonly Digits: unique symbol }
export namespace Digits {
  const stringIs = (v: string): v is Digits => /^\d*$/.test(v)

  export const FromString = fromRefinement(stringIs, 'Digits')

  export const Decoder = pipe(string, compose(FromString))
}

export type StringExact6 = Branded<NonEmptyString, StringExact6Brand>
type StringExact6Brand = { readonly StringExact6: unique symbol }
export namespace StringExact6 {
  const nonEmptyStringIs = (v: NonEmptyString): v is StringExact6 =>
    v.length === 6

  export const FromNonEmptyString = fromRefinement(
    nonEmptyStringIs,
    'StringExact6',
  )

  export const FromString = pipe(
    NonEmptyString.FromString,
    compose(FromNonEmptyString),
  )

  export const Decoder = pipe(string, compose(FromString))
}

export type DigitsExact6 = StringExact6 & Digits
export namespace DigitsExact6 {
  export const FromDigits: Decoder<Digits, DigitsExact6> = pipe(
    id<Digits>(),
    intersect(StringExact6.FromString),
  )

  export const FromStringExact6: Decoder<StringExact6, DigitsExact6> = pipe(
    id<StringExact6>(),
    intersect(Digits.FromString),
  )

  export const FromNonEmptyString: Decoder<NonEmptyString, DigitsExact6> = pipe(
    Digits.FromString,
    intersect(pipe(StringExact6.FromNonEmptyString)),
  )

  export const FromString = pipe(
    NonEmptyString.FromString,
    compose(FromNonEmptyString),
  )

  export const Decoder = pipe(Digits.Decoder, compose(FromDigits))
}

export type SmsCode = Branded<DigitsExact6, SmsCodeBrand>
type SmsCodeBrand = { readonly SmsCode: unique symbol }

export namespace SmsCode {
  const digitsExact6Is = (v: DigitsExact6): v is SmsCode => true

  export const FromString = pipe(
    DigitsExact6.FromString,
    refine(digitsExact6Is, 'SmsCode'),
  )

  export const Decoder = pipe(string, compose(FromString))
}
