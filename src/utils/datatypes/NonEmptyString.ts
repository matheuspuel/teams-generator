import { $, D } from 'fp'
import { fatal } from '../Error'

export const NonEmptyString = $(
  D.string,
  D.nonEmpty(),
  D.brand('NonEmptyString'),
)
export type NonEmptyString = D.Infer<typeof NonEmptyString>

export const NonEmptyStringOf = <S extends string>(
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
  D.is(NonEmptyString)(s)
    ? s
    : fatal(
        'Called `NonEmptyString.of` function with an empty string, which should not be possible',
      )
