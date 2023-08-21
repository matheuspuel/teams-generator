import { $, $f, D, F, Effect, O, identity } from 'fp'
import { SimpleStorage } from './simpleStorage'

export type Storage<A, B> = {
  __EncodedType: (_: A) => A
  get: Effect<never, unknown, B>
  set: (value: B) => Effect<never, unknown, void>
  remove: Effect<never, void, void>
  setOrRemove: (value: O.Option<B>) => Effect<never, unknown, void>
}

export const createStorage: <A, B>(args: {
  key: string
  schema: D.Schema<A, B>
}) => Storage<A, B> = ({ key, schema }) => ({
  __EncodedType: identity,
  get: $(key, SimpleStorage.get, F.flatMap(D.parseEither(schema))),
  set: $f(D.encodeEither(schema), F.flatMap(SimpleStorage.set(key))),
  remove: SimpleStorage.remove(key),
  setOrRemove: $f(
    O.match({
      onNone: () => SimpleStorage.remove(key),
      onSome: $f(D.encodeEither(schema), F.flatMap(SimpleStorage.set(key))),
    }),
  ),
})
