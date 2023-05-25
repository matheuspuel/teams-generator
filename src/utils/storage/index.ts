import { $, $f, D, O, TE, TaskEither, identity } from 'fp'
import { SimpleStorage } from './simpleStorage'

export type Storage<A, B> = {
  __EncodedType: (_: A) => A
  get: TaskEither<unknown, B>
  set: (value: B) => TE.TaskEither<unknown, void>
  remove: TE.TaskEither<void, void>
  setOrRemove: (value: O.Option<B>) => TE.TaskEither<unknown, void>
}

export const createStorage: <A, B>(args: {
  key: string
  schema: D.Schema<A, B>
}) => Storage<A, B> = ({ key, schema }) => ({
  __EncodedType: identity,
  get: $(key, SimpleStorage.get, TE.chainEitherKW(D.parseEither(schema))),
  set: $f(
    D.encodeEither(schema),
    TE.fromEither,
    TE.chainW(SimpleStorage.set(key)),
  ),
  remove: SimpleStorage.remove(key),
  setOrRemove: $f(
    O.match(
      () => SimpleStorage.remove(key),
      $f(
        D.encodeEither(schema),
        TE.fromEither,
        TE.chainW(SimpleStorage.set(key)),
      ),
    ),
  ),
})
