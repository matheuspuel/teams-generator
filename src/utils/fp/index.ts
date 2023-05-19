export * as Apply from 'fp-ts/Apply'
export * as A from './Array'
export * as Bool from './boolean'
export * as Console from 'fp-ts/Console'
export * as E from 'fp-ts/Either'
export * as EM from 'fp-ts/Endomorphism'
export * as Eq from './Eq'
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
  pipe as $,
  flow as $f,
} from 'fp-ts/function'
export * as IOE from 'fp-ts/IOEither'
export * as IOO from 'fp-ts/IOOption'
export * as Json from 'fp-ts/Json'
export * as Monoid from './Monoid'
export * as NEA from 'fp-ts/NonEmptyArray'
export * as Num from './number'
export * as O from './Option'
export * as R from './Reader'
export * as RIO from 'fp-ts/ReaderIO'
export * as RT from 'fp-ts/ReaderTask'
export * as RTE from 'fp-ts/ReaderTaskEither'
export * as RA from 'fp-ts/ReadonlyArray'
export * as RNEA from 'fp-ts/ReadonlyNonEmptyArray'
export * as RR from 'fp-ts/ReadonlyRecord'
export * as Rec from './Record'
export * as SG from './Semigroup'
export * as S from 'fp-ts/State'
export * as Show from 'fp-ts/Show'
export * as SRTE from 'fp-ts/StateReaderTaskEither'
export * as Str from 'fp-ts/string'
export * as T from 'fp-ts/Task'
export * as TE from 'fp-ts/TaskEither'
export * as TO from 'fp-ts/TaskOption'
export * as TT from 'fp-ts/TaskThese'
export * as Th from 'fp-ts/These'
export * as Tup from 'fp-ts/Tuple'
export * as D from './Schema'
import * as IO_ from 'fp-ts/IO'
export * as Ord from './Order'
export * as Optic from './Optic'

export { Order } from './Order'
export { Either, Left, Right, left, right, isLeft, isRight } from 'fp-ts/Either'
export { Endomorphism } from 'fp-ts/Endomorphism'
export { NonEmptyArray } from 'fp-ts/NonEmptyArray'
export { Option, none, some, isNone, isSome } from './Option'
export { Predicate } from 'fp-ts/Predicate'
export { Reader } from './Reader'
export { ReaderIO } from 'fp-ts/ReaderIO'
export { ReaderTaskEither } from 'fp-ts/ReaderTaskEither'
export { State } from 'fp-ts/State'
export { Task } from 'fp-ts/Task'
export { TaskEither } from 'fp-ts/TaskEither'
export { TaskOption } from 'fp-ts/TaskOption'
export { These, Both, both, isBoth } from 'fp-ts/These'
export { replace, get, modify } from './Optic'

export const IO = IO_
export type IO<A> = IO_.IO<A>
