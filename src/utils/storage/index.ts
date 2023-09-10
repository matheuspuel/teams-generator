import { Effect, F, O, S, flow, identity, pipe } from 'fp'
import { SimpleStorage } from './simpleStorage'

export type Storage<A> = {
  get: () => Effect<never, unknown, A>
  set: (value: A) => Effect<never, unknown, void>
  remove: () => Effect<never, void, void>
  setOrRemove: (value: O.Option<A>) => Effect<never, unknown, void>
}

export const createStorage: <I, A>(args: {
  key: string
  schema: S.Schema<I, A>
}) => Storage<A> = ({ key, schema }) => ({
  __EncodedType: identity,
  get: () => pipe(key, SimpleStorage.get, F.flatMap(S.parseEither(schema))),
  set: flow(S.encodeEither(schema), F.flatMap(SimpleStorage.set(key))),
  remove: () => SimpleStorage.remove(key),
  setOrRemove: flow(
    O.match({
      onNone: () => SimpleStorage.remove(key),
      onSome: flow(S.encodeEither(schema), F.flatMap(SimpleStorage.set(key))),
    }),
  ),
})
