export * as Apply from 'fp-ts/Apply'
export * as A from 'fp-ts/Array'
export * as Bool from 'fp-ts/boolean'
export * as Console from 'fp-ts/Console'
export * as E from 'fp-ts/Either'
export * as Eq from 'fp-ts/Eq'
export {
  absurd,
  apply,
  constant,
  constFalse,
  constNull,
  constTrue,
  constUndefined,
  constVoid,
  flow,
  identity,
  Lazy,
  pipe,
} from 'fp-ts/function'
export * as IOE from 'fp-ts/IOEither'
export * as IOO from 'fp-ts/IOOption'
export * as Json from 'fp-ts/Json'
export * as NEA from 'fp-ts/NonEmptyArray'
export * as Num from 'fp-ts/number'
export * as O from 'fp-ts/Option'
export * as R from 'fp-ts/Reader'
export * as RT from 'fp-ts/ReaderTask'
export * as RTE from 'fp-ts/ReaderTaskEither'
export * as RA from 'fp-ts/ReadonlyArray'
export * as RNEA from 'fp-ts/ReadonlyNonEmptyArray'
export * as RR from 'fp-ts/ReadonlyRecord'
export * as Rec from 'fp-ts/Record'
export * as Semigroup from 'fp-ts/Semigroup'
export * as S from 'fp-ts/State'
export * as SRTE from 'fp-ts/StateReaderTaskEither'
export * as Str from 'fp-ts/string'
export * as T from 'fp-ts/Task'
export * as TE from 'fp-ts/TaskEither'
export * as TO from 'fp-ts/TaskOption'
export * as TT from 'fp-ts/TaskThese'
export * as Th from 'fp-ts/These'
export * as D from 'io-ts/Decoder'
import { Either, Left, left, Right, right } from 'fp-ts/Either'
import * as IO_ from 'fp-ts/IO'
import { None, none, Option, Some, some } from 'fp-ts/Option'
import * as Ord_ from 'fp-ts/Ord'
import { Reader } from 'fp-ts/Reader'
import { ReaderTaskEither } from 'fp-ts/ReaderTaskEither'
import { State } from 'fp-ts/State'
import { StateReaderTaskEither } from 'fp-ts/StateReaderTaskEither'
import { Both, both, These } from 'fp-ts/These'
import { Decoder } from 'io-ts/Decoder'

export { Either, Left, left, Right, right }
export { None, none, Option, Some, some }
export { Reader }
export { ReaderTaskEither }
export { State }
export { StateReaderTaskEither }
export { Both, both, These }
export { Decoder }

export const IO = IO_
export type IO<A> = IO_.IO<A>
export const Ord = Ord_
export type Ord<A> = Ord_.Ord<A>
