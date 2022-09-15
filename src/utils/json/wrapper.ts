import { constVoid } from 'fp-ts/lib/function'
import { E } from 'src/utils/fp-ts'

const stringify: (value: unknown) => E.Either<void, string> = value =>
  E.tryCatch(() => JSON.stringify(value), constVoid)

const parse: (text: string) => E.Either<void, unknown> = text =>
  E.tryCatch(() => JSON.parse(text), constVoid)

export const JSONFP = {
  stringify,
  parse,
}
