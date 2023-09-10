import { D, Effect, F, O, flow, identity, pipe } from 'fp'
import { SimpleStorage } from './simpleStorage'

export type Storage<A> = {
  get: () => Effect<never, unknown, A>
  set: (value: A) => Effect<never, unknown, void>
  remove: () => Effect<never, void, void>
  setOrRemove: (value: O.Option<A>) => Effect<never, unknown, void>
}

export const createStorage: <I, A>(args: {
  key: string
  schema: D.Schema<I, A>
}) => Storage<A> = ({ key, schema }) => ({
  __EncodedType: identity,
  get: () => pipe(key, SimpleStorage.get, F.flatMap(D.parseEither(schema))),
  set: flow(D.encodeEither(schema), F.flatMap(SimpleStorage.set(key))),
  remove: () => SimpleStorage.remove(key),
  setOrRemove: flow(
    O.match({
      onNone: () => SimpleStorage.remove(key),
      onSome: flow(D.encodeEither(schema), F.flatMap(SimpleStorage.set(key))),
    }),
  ),
})
