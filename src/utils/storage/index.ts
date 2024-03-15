import { Effect, F, O, S, flow, identity, pipe } from 'fp'
import { SimpleStorage } from './simpleStorage'

export type Storage<A> = {
  get: () => Effect<A, unknown>
  set: (value: A) => Effect<void, unknown>
  remove: () => Effect<void, void>
  setOrRemove: (value: O.Option<A>) => Effect<void, unknown>
}

export const createStorage: <A, I>(args: {
  key: string
  schema: S.Schema<A, I>
}) => Storage<A> = ({ key, schema }) => ({
  __EncodedType: identity,
  get: () =>
    pipe(key, SimpleStorage.get, F.flatMap(S.decodeUnknownEither(schema))),
  set: flow(S.encodeEither(schema), F.flatMap(SimpleStorage.set(key))),
  remove: () => SimpleStorage.remove(key),
  setOrRemove: flow(
    O.match({
      onNone: () => SimpleStorage.remove(key),
      onSome: flow(S.encodeEither(schema), F.flatMap(SimpleStorage.set(key))),
    }),
  ),
})
