import { $, D } from 'fp'

export const NonEmptyString = $(
  D.string,
  D.nonEmpty(),
  D.brand('NonEmptyString'),
)
export type NonEmptyString = D.To<typeof NonEmptyString>
