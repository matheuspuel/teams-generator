import { S, pipe } from 'fp'

export const NonEmptyString = pipe(
  S.string,
  S.nonEmpty(),
  S.brand('NonEmptyString'),
)
export type NonEmptyString = S.Schema.To<typeof NonEmptyString>
