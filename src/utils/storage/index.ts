import { $, $f, D, O, TE, TO } from 'fp'
import { SimpleStorage } from './simpleStorage'

export type Storage<A> = {
  get: TO.TaskOption<A>
  set: (value: A) => TE.TaskEither<unknown, void>
  remove: TE.TaskEither<void, void>
  setOrRemove: (value: O.Option<A>) => TE.TaskEither<unknown, void>
}

export const createStorage: <A>(args: {
  key: string
  schema: D.Schema<A>
}) => Storage<A> = ({ key, schema }) => ({
  get: $(key, SimpleStorage.get, TO.chainOptionK(D.getOption(schema))),
  set: SimpleStorage.set(key),
  remove: SimpleStorage.remove(key),
  setOrRemove: $f(
    O.match(() => SimpleStorage.remove(key), SimpleStorage.set(key)),
  ),
})
