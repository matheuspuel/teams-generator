import { D, pipe } from 'fp'

export const NonEmptyString = pipe(
  D.string,
  D.nonEmpty(),
  D.brand('NonEmptyString'),
)
export type NonEmptyString = D.To<typeof NonEmptyString>
