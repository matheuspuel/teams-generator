import { $, $f, D, Eff, Effect, O, identity } from 'fp'
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
  get: $(key, SimpleStorage.get, Eff.flatMap(D.parseEither(schema))),
  set: $f(D.encodeEither(schema), Eff.flatMap(SimpleStorage.set(key))),
  remove: SimpleStorage.remove(key),
  setOrRemove: $f(
    O.match(
      () => SimpleStorage.remove(key),
      $f(D.encodeEither(schema), Eff.flatMap(SimpleStorage.set(key))),
    ),
  ),
})
