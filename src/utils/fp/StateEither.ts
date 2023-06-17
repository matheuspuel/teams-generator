/* eslint-disable functional/prefer-tacit */
/* eslint-disable functional/immutable-data */
/* eslint-disable functional/no-expression-statements */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable prefer-rest-params */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable functional/functional-parameters */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @since 2.0.0
 */
import { Alt3 } from 'fp-ts/Alt'
import { Applicative3 } from 'fp-ts/Applicative'
import {
  Apply3,
  apFirst as apFirst_,
  apS as apS_,
  apSecond as apSecond_,
} from 'fp-ts/Apply'
import { Bifunctor3 } from 'fp-ts/Bifunctor'
import * as chainable from 'fp-ts/Chain'
import * as E from 'fp-ts/Either'
import { Endomorphism } from 'fp-ts/Endomorphism'
import {
  FromEither1,
  FromEither2,
  FromEither2C,
  FromEither3,
  FromEither3C,
  FromEither4,
  FromEither as FromEither_,
  chainOptionK as chainOptionK_,
  filterOrElse as filterOrElse_,
  fromEitherK as fromEitherK_,
  fromOptionK as fromOptionK_,
  fromOption as fromOption_,
  fromPredicate as fromPredicate_,
} from 'fp-ts/FromEither'
import {
  FromState3,
  chainStateK as chainStateK_,
  fromStateK as fromStateK_,
  get as get_,
  gets as gets_,
  modify as modify_,
  put as put_,
} from 'fp-ts/FromState'
import {
  Functor1,
  Functor2,
  Functor3,
  Functor as Functor_,
  bindTo as bindTo_,
  flap as flap_,
  let as let__,
} from 'fp-ts/Functor'
import {
  HKT,
  HKT2,
  Kind,
  Kind2,
  Kind3,
  Kind4,
  URIS,
  URIS2,
  URIS3,
  URIS4,
} from 'fp-ts/HKT'
import { Monad3 } from 'fp-ts/Monad'
import { MonadThrow3 } from 'fp-ts/MonadThrow'
import { NonEmptyArray } from 'fp-ts/NonEmptyArray'
import * as O from 'fp-ts/Option'
import { Option } from 'fp-ts/Option'
import { Pointed3 } from 'fp-ts/Pointed'
import { Predicate } from 'fp-ts/Predicate'
import * as RA from 'fp-ts/ReadonlyArray'
import * as RNEA from 'fp-ts/ReadonlyNonEmptyArray'
import { ReadonlyNonEmptyArray } from 'fp-ts/ReadonlyNonEmptyArray'
import { Refinement } from 'fp-ts/Refinement'
import * as S from 'fp-ts/State'
import { State } from 'fp-ts/State'
import * as ST from 'fp-ts/StateT'
import {
  pipe as $,
  flow as $f,
  LazyArg,
  flow,
  identity,
  pipe,
} from 'fp-ts/function'

const liftOption =
  (F: any) =>
  <A extends ReadonlyArray<unknown>, B, E>(
    f: (...a: A) => Option<B>,
    onNone: (...a: A) => E,
  ) =>
  (...a: A) => {
    const o = f(...a)
    return F.fromEither(O.isNone(o) ? E.left(onNone(...a)) : E.right(o.value))
  }

const dual: {
  <
    DataLast extends (...args: Array<any>) => any,
    DataFirst extends (...args: Array<any>) => any,
  >(
    arity: Parameters<DataFirst>['length'],
    body: DataFirst,
  ): DataLast & DataFirst
  <
    DataLast extends (...args: Array<any>) => any,
    DataFirst extends (...args: Array<any>) => any,
  >(
    // eslint-disable-next-line @typescript-eslint/unified-signatures
    isDataFirst: (args: IArguments) => boolean,
    body: DataFirst,
  ): DataLast & DataFirst
} = (arity: any, body: any) => {
  const isDataFirst: (args: IArguments) => boolean =
    typeof arity === 'number' ? args => args.length >= arity : arity
  return function (this: any) {
    const args = Array.from(arguments)
    if (isDataFirst(arguments)) {
      return body.apply(this, args)
    }
    return (self: any) => body(self, ...args)
  }
}

function as_<F extends URIS3>(
  F: Functor3<F>,
): <S, E, A, _>(self: Kind3<F, S, E, _>, a: A) => Kind3<F, S, E, A>
function as_<F extends URIS2>(
  F: Functor2<F>,
): <E, A, _>(self: Kind2<F, E, _>, a: A) => Kind2<F, E, A>
function as_<F extends URIS>(
  F: Functor1<F>,
): <A, _>(self: Kind<F, _>, a: A) => Kind<F, A>
function as_<F>(F: Functor_<F>): <A, _>(self: HKT<F, _>, a: A) => HKT<F, A>
function as_<F>(F: Functor_<F>): <A, _>(self: HKT<F, _>, b: A) => HKT<F, A> {
  return (self, b) => F.map(self, () => b)
}

function asUnit_<F extends URIS3>(
  F: Functor3<F>,
): <S, E, _>(self: Kind3<F, S, E, _>) => Kind3<F, S, E, void>
function asUnit_<F extends URIS2>(
  F: Functor2<F>,
): <E, _>(self: Kind2<F, E, _>) => Kind2<F, E, void>
function asUnit_<F extends URIS>(
  F: Functor1<F>,
): <_>(self: Kind<F, _>) => Kind<F, void>
function asUnit_<F>(F: Functor_<F>): <_>(self: HKT<F, _>) => HKT<F, void>
function asUnit_<F>(F: Functor_<F>): <_>(self: HKT<F, _>) => HKT<F, void> {
  const asM = as_(F)
  return self => asM(self, undefined)
}

const flatMapOption_ = (F: any, M: any) =>
  dual(3, (self: any, f: any, onNone: any) =>
    M.flatMap(self, liftOption(F)(f, onNone)),
  )

function flatMapST<M extends URIS3>(
  M: chainable.Chain3<M>,
): <S, R, E, A, B>(
  ma: ST.StateT3<M, S, R, E, A>,
  f: (a: A) => ST.StateT3<M, S, R, E, B>,
) => ST.StateT<M, S, B>
function flatMapST<M>(
  M: chainable.Chain<M>,
): <S, A, B>(
  ma: ST.StateT<M, S, A>,
  f: (a: A) => ST.StateT<M, S, B>,
) => ST.StateT<M, S, B>
function flatMapST<M>(
  M: chainable.Chain<M>,
): <S, A, B>(
  ma: ST.StateT<M, S, A>,
  f: (a: A) => ST.StateT<M, S, B>,
) => ST.StateT<M, S, B> {
  return (ma, f) => s => M.chain(ma(s), ([a, s1]) => f(a)(s1))
}

function tapChainable<M extends URIS4>(
  M: chainable.Chain4<M>,
): <S, R1, E1, A, R2, E2, _>(
  first: Kind4<M, S, R1, E1, A>,
  f: (a: A) => Kind4<M, S, R2, E2, _>,
) => Kind4<M, S, R1 & R2, E1 | E2, A>
function tapChainable<M extends URIS3>(
  M: chainable.Chain3<M>,
): <R1, E1, A, R2, E2, _>(
  first: Kind3<M, R1, E1, A>,
  f: (a: A) => Kind3<M, R2, E2, _>,
) => Kind3<M, R1 & R2, E1 | E2, A>
function tapChainable<M extends URIS2>(
  M: chainable.Chain2<M>,
): <E1, A, E2, _>(
  first: Kind2<M, E1, A>,
  f: (a: A) => Kind2<M, E2, _>,
) => Kind2<M, E1 | E2, A>
function tapChainable<M extends URIS>(
  M: chainable.Chain1<M>,
): <A, _>(first: Kind<M, A>, f: (a: A) => Kind<M, _>) => Kind<M, A>
function tapChainable<M>(
  M: chainable.Chain<M>,
): <A, _>(first: HKT<M, A>, f: (a: A) => HKT<M, _>) => HKT<M, A>
function tapChainable<M>(
  M: chainable.Chain<M>,
): <A, _>(first: HKT<M, A>, f: (a: A) => HKT<M, _>) => HKT<M, A> {
  return (first, f) => M.chain(first, a => M.map(f(a), () => a))
}

function tapEither_<M extends URIS4>(
  F: FromEither4<M>,
  M: chainable.Chain4<M>,
): <A, E, B, S, R>(
  self: Kind4<M, S, R, E, A>,
  f: (a: A) => Either<E, B>,
) => Kind4<M, S, R, E, A>
function tapEither_<M extends URIS3>(
  F: FromEither3<M>,
  M: chainable.Chain3<M>,
): <A, E, B, R>(
  self: Kind3<M, R, E, A>,
  f: (a: A) => Either<E, B>,
) => Kind3<M, R, E, A>
function tapEither_<M extends URIS3, E>(
  F: FromEither3C<M, E>,
  M: chainable.Chain3C<M, E>,
): <A, B, R>(
  self: Kind3<M, R, E, A>,
  f: (a: A) => Either<E, B>,
) => Kind3<M, R, E, A>
function tapEither_<M extends URIS2>(
  F: FromEither2<M>,
  M: chainable.Chain2<M>,
): <A, E, B>(self: Kind2<M, E, A>, f: (a: A) => Either<E, B>) => Kind2<M, E, A>
function tapEither_<M extends URIS2, E>(
  F: FromEither2C<M, E>,
  M: chainable.Chain2C<M, E>,
): <A, B>(self: Kind2<M, E, A>, f: (a: A) => Either<E, B>) => Kind2<M, E, A>
function tapEither_<M extends URIS>(
  F: FromEither1<M>,
  M: chainable.Chain1<M>,
): <E, A, B>(self: Kind<M, A>, f: (a: A) => Either<E, B>) => Kind<M, A>
function tapEither_<M>(
  F: FromEither_<M>,
  M: chainable.Chain<M>,
): <A, E, B>(self: HKT2<M, E, A>, f: (a: A) => Either<E, B>) => HKT2<M, E, A>
function tapEither_<M extends URIS2>(
  F: FromEither2<M>,
  M: chainable.Chain2<M>,
): <A, E, B>(
  self: Kind2<M, E, A>,
  f: (a: A) => Either<E, B>,
) => Kind2<M, E, A> {
  const fromEither = fromEitherK_(F)
  const tapM = tapChainable(M)
  return (self, f) => tapM(self, fromEither(f))
}

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

import Either = E.Either

/**
 * @category model
 * @since 2.0.0
 */
export type StateEither<S, E, A> = (s: S) => Either<E, [A, S]>

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * @category constructors
 * @since 2.0.0
 */
export const left: <S, E, A = never>(e: E) => StateEither<S, E, A> = e => () =>
  E.left(e)

/**
 * @category constructors
 * @since 2.0.0
 */
export const right: <S, E = never, A = never>(a: A) => StateEither<S, E, A> =
  /*#__PURE__*/ ST.of(E.Pointed)

/**
 * @category constructors
 * @since 2.0.0
 */
export const rightState: <S, E = never, A = never>(
  ma: State<S, A>,
) => StateEither<S, E, A> = sa => flow(sa, E.right)

/**
 * @category constructors
 * @since 2.0.0
 */
export const leftState: <S, E, A = never>(
  me: State<S, E>,
) => StateEither<S, E, A> = me => s => E.left(me(s)[0])

// -------------------------------------------------------------------------------------
// conversions
// -------------------------------------------------------------------------------------

/**
 * @category conversions
 * @since 2.0.0
 */
export const fromEither: <E, A, S>(fa: Either<E, A>) => StateEither<S, E, A> =
  /*#__PURE__*/ E.match(e => left(e), right)

/**
 * @category conversions
 * @since 2.10.0
 */
export const fromState: <S, A, E = never>(
  fa: State<S, A>,
) => StateEither<S, E, A> = /*#__PURE__*/ ST.fromState(E.Pointed)

export const toStateWithEither: <S, A, E>(
  fa: StateEither<S, E, A>,
) => State<S, Either<E, A>> = fa => s =>
  pipe(
    s,
    fa,
    E.matchW(
      e => [E.left(e), s],
      ([a, s]) => [E.right(a), s],
    ),
  )

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

/* istanbul ignore next */
const _map: Monad3<URI>['map'] = (fa, f) => pipe(fa, map(f))
/* istanbul ignore next */
const _ap: Monad3<URI>['ap'] = (fab, fa) => pipe(fab, ap(fa))
/* istanbul ignore next */
const _alt: <S, E, A>(
  fa: StateEither<S, E, A>,
  that: LazyArg<StateEither<S, E, A>>,
) => StateEither<S, E, A> = (fa, that) => s =>
  pipe(
    fa(s),
    E.alt(() => that()(s)),
  )
const _bimap: <S, E, A, G, B>(
  fea: StateEither<S, E, A>,
  f: (e: E) => G,
  g: (a: A) => B,
) => StateEither<S, G, B> = (fea, f, g) => s =>
  pipe(
    fea(s),
    E.bimap(f, ([a, s]) => [g(a), s]),
  )
const _mapLeft: <S, E, A, G>(
  fea: StateEither<S, E, A>,
  f: (e: E) => G,
) => StateEither<S, G, A> = (fea, f) => s => pipe(fea(s), E.mapLeft(f))

/**
 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: F<A>) => F<B>` whose argument and return types
 * use the type constructor `F` to represent some computational context.
 *
 * @category mapping
 * @since 2.0.0
 */
export const map: <A, B>(
  f: (a: A) => B,
) => <S, E>(fa: StateEither<S, E, A>) => StateEither<S, E, B> =
  /*#__PURE__*/ ST.map(E.Functor)

/**
 * Map a pair of functions over the two last type arguments of the bifunctor.
 *
 * @category mapping
 * @since 2.6.2
 */
export const bimap: <E, G, A, B>(
  f: (e: E) => G,
  g: (a: A) => B,
) => <S>(fa: StateEither<S, E, A>) => StateEither<S, G, B> = (f, g) => fa =>
  _bimap(fa, f, g)

/**
 * Map a function over the third type argument of a bifunctor.
 *
 * @category error handling
 * @since 2.6.2
 */
export const mapLeft: <E, G>(
  f: (e: E) => G,
) => <S, A>(fa: StateEither<S, E, A>) => StateEither<S, G, A> = f => fa =>
  _mapLeft(fa, f)

/**
 * @since 2.0.0
 */
export const ap: <S, E, A>(
  fa: StateEither<S, E, A>,
) => <B>(fab: StateEither<S, E, (a: A) => B>) => StateEither<S, E, B> =
  /*#__PURE__*/ ST.ap(E.Chain)

/**
 * Less strict version of [`ap`](#ap).
 *
 * The `W` suffix (short for **W**idening) means that the environment types and the error types will be merged.
 *
 * @since 2.8.0
 */
export const apW: <S, E2, A>(
  fa: StateEither<S, E2, A>,
) => <E1, B>(
  fab: StateEither<S, E1, (a: A) => B>,
) => StateEither<S, E1 | E2, B> = ap as any

/**
 * @category constructors
 * @since 2.7.0
 */
export const of: <S, E = never, A = never>(a: A) => StateEither<S, E, A> = right

const _FromEither = { fromEither }

/**
 * @category sequencing
 * @since 2.14.0
 */
export const flatMap: {
  <A, S, E2, B>(f: (a: A) => StateEither<S, E2, B>): <E1>(
    ma: StateEither<S, E1, A>,
  ) => StateEither<S, E1 | E2, B>
  <S, E1, A, E2, B>(
    ma: StateEither<S, E1, A>,
    f: (a: A) => StateEither<S, E2, B>,
  ): StateEither<S, E1 | E2, B>
} = /*#__PURE__*/ dual(2, flatMapST(E.Monad as any))

const _FlatMap = { flatMap }

const flatMapEither_ = (F: any, M: any) =>
  dual(2, (self: any, f: any) =>
    M.flatMap(self, (a: any) => F.fromEither(f(a))),
  )

/**
 * @category sequencing
 * @since 2.16.0
 */
export const flatMapEither: {
  <A, E2, B>(f: (a: A) => Either<E2, B>): <S, E1>(
    self: StateEither<S, E1, A>,
  ) => StateEither<S, E1 | E2, B>
  <S, E1, A, E2, B>(
    self: StateEither<S, E1, A>,
    f: (a: A) => Either<E2, B>,
  ): StateEither<S, E1 | E2, B>
} = /*#__PURE__*/ dual(2, flatMapEither_(_FromEither, _FlatMap))

/**
 * @category sequencing
 * @since 2.16.0
 */
export const flatMapOption: {
  <A, E2, B>(f: (a: A) => Option<B>, onNone: (a: A) => E2): <S, E1>(
    self: StateEither<S, E1, A>,
  ) => StateEither<S, E1 | E2, B>
  <S, E1, A, E2, B>(
    self: StateEither<S, E1, A>,
    f: (a: A) => Option<B>,
    onNone: (a: A) => E2,
  ): StateEither<S, E1 | E2, B>
} = flatMapOption_(_FromEither, _FlatMap)

/**
 * @category sequencing
 * @since 2.16.0
 */
export const flatMapState: {
  <S, A, B>(f: (a: A) => State<S, B>): <E>(
    self: StateEither<S, E, A>,
  ) => StateEither<S, E, B>
  <S, E, A, B>(
    self: StateEither<S, E, A>,
    f: (a: A) => State<S, B>,
  ): StateEither<S, E, B>
} = /*#__PURE__*/ dual(
  2,
  <S, E, A, B>(
    self: StateEither<S, E, A>,
    f: (a: A) => State<S, B>,
  ): StateEither<S, E, B> => flatMap(self, fromStateK(f)),
)

/**
 * Less strict version of [`flatten`](#flatten).
 *
 * The `W` suffix (short for **W**idening) means that the environment types and the error types will be merged.
 *
 * @category sequencing
 * @since 2.11.0
 */
export const flattenW: <S, E1, E2, A>(
  mma: StateEither<S, E1, StateEither<S, E2, A>>,
) => StateEither<S, E1 | E2, A> = /*#__PURE__*/ flatMap(identity)

/**
 * @category sequencing
 * @since 2.0.0
 */
export const flatten: <S, E, A>(
  mma: StateEither<S, E, StateEither<S, E, A>>,
) => StateEither<S, E, A> = flattenW

/**
 * Less strict version of [`alt`](#alt).
 *
 * The `W` suffix (short for **W**idening) means that the environment, the error and the return types will be merged.
 *
 * @category error handling
 * @since 2.9.0
 */
export const altW =
  <S, E2, B>(that: () => StateEither<S, E2, B>) =>
  <E1, A>(fa: StateEither<S, E1, A>): StateEither<S, E2, A | B> =>
  r =>
    pipe(
      fa(r),
      E.altW(() => that()(r)),
    )

/**
 * Identifies an associative operation on a type constructor. It is similar to `Semigroup`, except that it applies to
 * types of kind `* -> *`.
 *
 * @category error handling
 * @since 2.6.2
 */
export const alt: <S, E, A>(
  that: LazyArg<StateEither<S, E, A>>,
) => (fa: StateEither<S, E, A>) => StateEither<S, E, A> = altW

/**
 * @since 2.7.0
 */
export const throwError: MonadThrow3<URI>['throwError'] = left

/**
 * @category type lambdas
 * @since 2.0.0
 */
export const URI = 'StateEither'

/**
 * @category type lambdas
 * @since 2.0.0
 */
export type URI = typeof URI

declare module 'fp-ts/HKT' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface URItoKind3<R, E, A> {
    readonly [URI]: StateEither<R, E, A>
  }
}

/**
 * @category instances
 * @since 2.7.0
 */
export const Functor: Functor3<URI> = {
  URI,
  map: _map,
}

/**
 * Maps the `Right` value of this `StateEither` to the specified constant value.
 *
 * @category mapping
 * @since 2.16.0
 */
export const as: {
  <A>(a: A): <S, E, _>(self: StateEither<S, E, _>) => StateEither<S, E, A>
  <S, E, _, A>(self: StateEither<S, E, _>, a: A): StateEither<S, E, A>
} = dual(2, as_(Functor))

/**
 * Maps the `Right` value of this `StateEither` to the void constant value.
 *
 * @category mapping
 * @since 2.16.0
 */
export const asUnit: <S, E, _>(
  self: StateEither<S, E, _>,
) => StateEither<S, E, void> = asUnit_(Functor)

/**
 * @category mapping
 * @since 2.10.0
 */
export const flap = /*#__PURE__*/ flap_(Functor)

/**
 * @category instances
 * @since 2.10.0
 */
export const Pointed: Pointed3<URI> = {
  URI,
  of,
}

/**
 * @category instances
 * @since 2.10.0
 */
export const Apply: Apply3<URI> = {
  URI,
  map: _map,
  ap: _ap,
}

/**
 * Combine two effectful actions, keeping only the result of the first.
 *
 * @since 2.0.0
 */
export const apFirst = /*#__PURE__*/ apFirst_(Apply)

/**
 * Less strict version of [`apFirst`](#apfirst).
 *
 * The `W` suffix (short for **W**idening) means that the environment types and the error types will be merged.
 *
 * @since 2.12.0
 */
export const apFirstW: <S, E2, A, B>(
  second: StateEither<S, E2, B>,
) => <E1>(first: StateEither<S, E1, A>) => StateEither<S, E1 | E2, A> =
  apFirst as any

/**
 * Combine two effectful actions, keeping only the result of the second.
 *
 * @since 2.0.0
 */
export const apSecond = /*#__PURE__*/ apSecond_(Apply)

/**
 * Less strict version of [`apSecond`](#apsecond).
 *
 * The `W` suffix (short for **W**idening) means that the environment types and the error types will be merged.
 *
 * @since 2.12.0
 */
export const apSecondW: <S, E2, A, B>(
  second: StateEither<S, E2, B>,
) => <E1>(first: StateEither<S, E1, A>) => StateEither<S, E1 | E2, B> =
  apSecond as any

/**
 * @category instances
 * @since 2.7.0
 */
export const Applicative: Applicative3<URI> = {
  URI,
  map: _map,
  ap: _ap,
  of,
}

/**
 * @category instances
 * @since 2.10.0
 */
export const Chain: chainable.Chain3<URI> = {
  URI,
  map: _map,
  ap: _ap,
  chain: flatMap,
}

/**
 * @category instances
 * @since 2.11.0
 */
export const FromState: FromState3<URI> = {
  URI,
  fromState,
}

/**
 * Get the current state
 *
 * @category constructors
 * @since 2.0.0
 */
export const get: <S, E = never>() => StateEither<S, E, S> =
  /*#__PURE__*/ get_(FromState)

/**
 * Set the state
 *
 * @category constructors
 * @since 2.0.0
 */
export const put: <S, E = never>(s: S) => StateEither<S, E, void> =
  /*#__PURE__*/ put_(FromState)

/**
 * Modify the state by applying a function to the current state
 *
 * @category constructors
 * @since 2.0.0
 */
export const modify: <S, E = never>(
  f: Endomorphism<S>,
) => StateEither<S, E, void> = /*#__PURE__*/ modify_(FromState)

/**
 * Get a value which depends on the current state
 *
 * @category constructors
 * @since 2.0.0
 */
export const gets: <S, E = never, A = never>(
  f: (s: S) => A,
) => StateEither<S, E, A> = /*#__PURE__*/ gets_(FromState)

/**
 * @category lifting
 * @since 2.11.0
 */
export const fromStateK: <A extends ReadonlyArray<unknown>, S, B>(
  f: (...a: A) => State<S, B>,
) => <E = never>(...a: A) => StateEither<S, E, B> =
  /*#__PURE__*/ fromStateK_(FromState)

/**
 * Alias of `flatMapState`.
 *
 * @category legacy
 * @since 2.11.0
 */
export const chainStateK: <A, S, B>(
  f: (a: A) => State<S, B>,
) => <E>(ma: StateEither<S, E, A>) => StateEither<S, E, B> =
  /*#__PURE__*/ chainStateK_(FromState, Chain)

/**
 * @category instances
 * @since 2.10.0
 */
export const Monad: Monad3<URI> = {
  URI,
  map: _map,
  ap: _ap,
  of,
  chain: flatMap,
}

/**
 * @category instances
 * @since 2.10.0
 */
export const MonadThrow: MonadThrow3<URI> = {
  URI,
  map: _map,
  ap: _ap,
  of,
  chain: flatMap,
  throwError,
}

/**
 * @category instances
 * @since 2.10.0
 */
export const FromEither: FromEither3<URI> = {
  URI,
  fromEither,
}

/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation and
 * keeping only the result of the first.
 *
 * @category combinators
 * @since 2.15.0
 */
export const tap: {
  <S, E1, A, E2, _>(
    self: StateEither<S, E1, A>,
    f: (a: A) => StateEither<S, E2, _>,
  ): StateEither<S, E1 | E2, A>
  <A, S, E2, _>(f: (a: A) => StateEither<S, E2, _>): <E1>(
    self: StateEither<S, E1, A>,
  ) => StateEither<S, E2 | E1, A>
} = /*#__PURE__*/ dual(2, tapChainable(Chain))

/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation and
 * keeping only the result of the first.
 *
 * @category combinators
 * @since 2.16.0
 */
export const tapEither: {
  <A, E2, _>(f: (a: A) => Either<E2, _>): <S, E1>(
    self: StateEither<S, E1, A>,
  ) => StateEither<S, E2 | E1, A>
  <S, E1, A, E2, _>(
    self: StateEither<S, E1, A>,
    f: (a: A) => Either<E2, _>,
  ): StateEither<S, E1 | E2, A>
} = /*#__PURE__*/ dual(2, tapEither_(FromEither, Chain))

export const tapState = <S, A, _>(f: (a: A) => State<S, _>) =>
  tap((a: A) => fromState(f(a)))

/**
 * @category instances
 * @since 2.7.0
 */
export const Bifunctor: Bifunctor3<URI> = {
  URI,
  bimap: _bimap,
  mapLeft: _mapLeft,
}

/**
 * @category instances
 * @since 2.7.0
 */
export const Alt: Alt3<URI> = {
  URI,
  map: _map,
  alt: _alt,
}

/**
 * @category conversions
 * @since 2.0.0
 */
export const fromOption: <E>(
  onNone: LazyArg<E>,
) => <A, S>(fa: Option<A>) => StateEither<S, E, A> =
  /*#__PURE__*/ fromOption_(FromEither)

/**
 * @category lifting
 * @since 2.10.0
 */
export const fromOptionK: <E>(
  onNone: LazyArg<E>,
) => <A extends ReadonlyArray<unknown>, B>(
  f: (...a: A) => Option<B>,
) => <S>(...a: A) => StateEither<S, E, B> =
  /*#__PURE__*/ fromOptionK_(FromEither)

/**
 * Use `flatMapOption`.
 *
 * @category legacy
 * @since 2.10.0
 */
export const chainOptionK: <E>(
  onNone: LazyArg<E>,
) => <A, B>(
  f: (a: A) => Option<B>,
) => <S>(ma: StateEither<S, E, A>) => StateEither<S, E, B> =
  /*#__PURE__*/ chainOptionK_(FromEither, Chain)

/**
 * Use `flatMapOption`.
 *
 * Less strict version of [`chainOptionK`](#chainoptionk).
 *
 * The `W` suffix (short for **W**idening) means that the error types will be merged.
 *
 * @category legacy
 * @since 2.13.2
 */
export const chainOptionKW: <E2>(
  onNone: LazyArg<E2>,
) => <A, B>(
  f: (a: A) => Option<B>,
) => <S, E1>(ma: StateEither<S, E1, A>) => StateEither<S, E1 | E2, B> =
  /*#__PURE__*/ chainOptionK as any

/**
 * Alias of `flatMapEither`.
 *
 * @category legacy
 * @since 2.4.0
 */
export const chainEitherK: <E, A, B>(
  f: (a: A) => E.Either<E, B>,
) => <S>(ma: StateEither<S, E, A>) => StateEither<S, E, B> = flatMapEither

/**
 * Alias of `flatMapEither`.
 *
 * Less strict version of [`chainEitherK`](#chaineitherk).
 *
 * The `W` suffix (short for **W**idening) means that the error types will be merged.
 *
 * The `W` suffix (short for **W**idening) means that the environment types and the error types will be merged.
 *
 * @category legacy
 * @since 2.6.1
 */
export const chainEitherKW: <E2, A, B>(
  f: (a: A) => Either<E2, B>,
) => <S, E1>(ma: StateEither<S, E1, A>) => StateEither<S, E1 | E2, B> =
  flatMapEither

/**
 * Alias of `tapEither`.
 *
 * @category legacy
 * @since 2.12.0
 */
export const chainFirstEitherK: <A, E, B>(
  f: (a: A) => E.Either<E, B>,
) => <S>(ma: StateEither<S, E, A>) => StateEither<S, E, A> = tapEither

/**
 * Alias of `tapEither`.
 *
 * Less strict version of [`chainFirstEitherK`](#chainfirsteitherk).
 *
 * The `W` suffix (short for **W**idening) means that the environment types and the error types will be merged.
 *
 * @category legacy
 * @since 2.12.0
 */
export const chainFirstEitherKW: <A, E2, B>(
  f: (a: A) => Either<E2, B>,
) => <S, E1>(ma: StateEither<S, E1, A>) => StateEither<S, E1 | E2, A> =
  tapEither

/**
 * @category lifting
 * @since 2.4.4
 */
export const fromPredicate: {
  <E, A, B extends A>(refinement: Refinement<A, B>, onFalse: (a: A) => E): <S>(
    a: A,
  ) => StateEither<S, E, B>
  <E, A>(predicate: Predicate<A>, onFalse: (a: A) => E): <S, B extends A = A>(
    b: B,
  ) => StateEither<S, E, B>
  <E, A>(predicate: Predicate<A>, onFalse: (a: A) => E): <S>(
    a: A,
  ) => StateEither<S, E, A>
} = /*#__PURE__*/ fromPredicate_(FromEither)

/**
 * @category filtering
 * @since 2.4.4
 */
export const filterOrElse: {
  <E, A, B extends A>(refinement: Refinement<A, B>, onFalse: (a: A) => E): <S>(
    ma: StateEither<S, E, A>,
  ) => StateEither<S, E, B>
  <E, A>(predicate: Predicate<A>, onFalse: (a: A) => E): <S, B extends A>(
    mb: StateEither<S, E, B>,
  ) => StateEither<S, E, B>
  <E, A>(predicate: Predicate<A>, onFalse: (a: A) => E): <S>(
    ma: StateEither<S, E, A>,
  ) => StateEither<S, E, A>
} = /*#__PURE__*/ filterOrElse_(FromEither, Chain)

/**
 * Less strict version of [`filterOrElse`](#filterorelse).
 *
 * The `W` suffix (short for **W**idening) means that the error types will be merged.
 *
 * @category filtering
 * @since 2.9.0
 */
export const filterOrElseW: {
  <A, B extends A, E2>(refinement: Refinement<A, B>, onFalse: (a: A) => E2): <
    S,
    E1,
  >(
    ma: StateEither<S, E1, A>,
  ) => StateEither<S, E1 | E2, B>
  <A, E2>(predicate: Predicate<A>, onFalse: (a: A) => E2): <S, E1, B extends A>(
    mb: StateEither<S, E1, B>,
  ) => StateEither<S, E1 | E2, B>
  <A, E2>(predicate: Predicate<A>, onFalse: (a: A) => E2): <S, E1>(
    ma: StateEither<S, E1, A>,
  ) => StateEither<S, E1 | E2, A>
} = filterOrElse

/**
 * @category lifting
 * @since 2.4.0
 */
export const fromEitherK: <E, A extends ReadonlyArray<unknown>, B>(
  f: (...a: A) => E.Either<E, B>,
) => <S>(...a: A) => StateEither<S, E, B> =
  /*#__PURE__*/ fromEitherK_(FromEither)

// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------

/**
 * Run a computation in the `StateEither` monad, discarding the final state
 *
 * @since 2.8.0
 */
export const evaluate: <S>(
  s: S,
) => <E, A>(ma: StateEither<S, E, A>) => Either<E, A> =
  /*#__PURE__*/ ST.evaluate(E.Functor)

/**
 * Run a computation in the `StateEither` monad discarding the result
 *
 * @since 2.8.0
 */
export const execute: <S>(
  s: S,
) => <E, A>(ma: StateEither<S, E, A>) => Either<E, S> =
  /*#__PURE__*/ ST.execute(E.Functor)

// -------------------------------------------------------------------------------------
// do notation
// -------------------------------------------------------------------------------------

/**
 * @since 2.8.0
 */
export const bindTo = /*#__PURE__*/ bindTo_(Functor)

const let_ = /*#__PURE__*/ let__(Functor)

export { let_ as let }

/**
 * @since 2.8.0
 */
export const bind = /*#__PURE__*/ chainable.bind(Chain)

/**
 * The `W` suffix (short for **W**idening) means that the environment types and the error types will be merged.
 *
 * @since 2.8.0
 */
export const bindW: <N extends string, A, S, E2, B>(
  name: Exclude<N, keyof A>,
  f: (a: A) => StateEither<S, E2, B>,
) => <E1>(
  fa: StateEither<S, E1, A>,
) => StateEither<
  S,
  E1 | E2,
  { readonly [K in keyof A | N]: K extends keyof A ? A[K] : B }
> = bind as any

// -------------------------------------------------------------------------------------
// pipeable sequence S
// -------------------------------------------------------------------------------------

/**
 * @since 2.8.0
 */
export const apS = /*#__PURE__*/ apS_(Apply)

/**
 * Less strict version of [`apS`](#aps).
 *
 * The `W` suffix (short for **W**idening) means that the environment types and the error types will be merged.
 *
 * @category do notation
 * @since 2.8.0
 */
export const apSW: <A, N extends string, S, E2, B>(
  name: Exclude<N, keyof A>,
  fb: StateEither<S, E2, B>,
) => <E1>(
  fa: StateEither<S, E1, A>,
) => StateEither<
  S,
  E1 | E2,
  { readonly [K in keyof A | N]: K extends keyof A ? A[K] : B }
> = apS as any

// -------------------------------------------------------------------------------------
// array utils
// -------------------------------------------------------------------------------------

/**
 * Equivalent to `ReadonlyNonEmptyArray#traverseWithIndex(Applicative)`.
 *
 * @category traversing
 * @since 2.11.0
 */
export const traverseReadonlyNonEmptyArrayWithIndex =
  <A, S, E, B>(f: (index: number, a: A) => StateEither<S, E, B>) =>
  (as: ReadonlyNonEmptyArray<A>): StateEither<S, E, ReadonlyNonEmptyArray<B>> =>
  s =>
    RNEA.tail(as).reduce<Either<E, [NonEmptyArray<B>, S]>>(
      (ebs, a, i) =>
        E.isLeft(ebs)
          ? ebs
          : pipe(f(i + 1, a)(ebs.right[1]), eb => {
              if (E.isLeft(eb)) {
                return eb
              }
              const [b, s] = eb.right
              ebs.right[0].push(b)
              ebs.right[1] = s
              return ebs
            }),
      pipe(
        f(0, RNEA.head(as))(s),
        E.map(([b, s]) => [[b], s]),
      ),
    )

/**
 * Equivalent to `ReadonlyArray#traverseWithIndex(Applicative)`.
 *
 * @category traversing
 * @since 2.11.0
 */
export const traverseReadonlyArrayWithIndex = <A, S, E, B>(
  f: (index: number, a: A) => StateEither<S, E, B>,
): ((as: ReadonlyArray<A>) => StateEither<S, E, ReadonlyArray<B>>) => {
  const g = traverseReadonlyNonEmptyArrayWithIndex(f)
  return as => (RA.isNonEmpty(as) ? g(as) : of(RA.empty))
}

/**
 * Equivalent to `ReadonlyArray#traverseWithIndex(Applicative)`.
 *
 * @category traversing
 * @since 2.9.0
 */
export const traverseArrayWithIndex: <S, E, A, B>(
  f: (index: number, a: A) => StateEither<S, E, B>,
) => (as: ReadonlyArray<A>) => StateEither<S, E, ReadonlyArray<B>> =
  traverseReadonlyArrayWithIndex

/**
 * Equivalent to `ReadonlyArray#traverse(Applicative)`.
 *
 * @category traversing
 * @since 2.9.0
 */
export const traverseArray = <S, E, A, B>(
  f: (a: A) => StateEither<S, E, B>,
): ((as: ReadonlyArray<A>) => StateEither<S, E, ReadonlyArray<B>>) =>
  traverseReadonlyArrayWithIndex((_, a) => f(a))

/**
 * Equivalent to `ReadonlyArray#sequence(Applicative)`.
 *
 * @category traversing
 * @since 2.9.0
 */
export const sequenceArray: <S, E, A>(
  arr: ReadonlyArray<StateEither<S, E, A>>,
) => StateEither<S, E, ReadonlyArray<A>> = /*#__PURE__*/ traverseArray(identity)

// -------------------------------------------------------------------------------------
// legacy
// -------------------------------------------------------------------------------------

/**
 * Alias of `flatMap`.
 *
 * @category legacy
 * @since 2.0.0
 */
export const chain: <S, E, A, B>(
  f: (a: A) => StateEither<S, E, B>,
) => (ma: StateEither<S, E, A>) => StateEither<S, E, B> = flatMap

/**
 * Alias of `flatMap`.
 *
 * @category legacy
 * @since 2.6.0
 */
export const chainW: <S, E2, A, B>(
  f: (a: A) => StateEither<S, E2, B>,
) => <E1>(ma: StateEither<S, E1, A>) => StateEither<S, E1 | E2, B> = flatMap

/**
 * Alias of `tap`.
 *
 * @category legacy
 * @since 2.0.0
 */
export const chainFirst: <S, E, A, B>(
  f: (a: A) => StateEither<S, E, B>,
) => (ma: StateEither<S, E, A>) => StateEither<S, E, A> = tap

/**
 * Alias of `tap`.
 *
 * @category legacy
 * @since 2.8.0
 */
export const chainFirstW: <S, E2, A, B>(
  f: (a: A) => StateEither<S, E2, B>,
) => <E1>(ma: StateEither<S, E1, A>) => StateEither<S, E1 | E2, A> = tap

// spell-checker:words idening effectful apfirst apsecond chainoptionk chaineitherk chainfirsteitherk filterorelse pipeable

export const matchStateEither =
  <S, E, EB, B, A, EC, C>(
    onLeft: (e: E) => StateEither<S, EB, B>,
    onRight: (a: A) => StateEither<S, EC, C>,
  ) =>
  (ma: StateEither<S, E, A>): StateEither<S, EB | EC, B | C> =>
    $(
      ma,
      toStateWithEither,
      S.flatMap(
        $f(
          E.matchW(
            $f(onLeft, toStateWithEither),
            $f(onRight, toStateWithEither),
          ),
          (v): State<S, E.Either<EB | EC, B | C>> => v,
        ),
      ),
      fromState,
      flatMapEither(identity),
    )
