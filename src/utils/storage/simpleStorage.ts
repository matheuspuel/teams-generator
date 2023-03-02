import { $f, Json, O, TE, TO } from 'fp'
import { AsyncStorageFP } from './wrapper'

const get: (key: string) => TO.TaskOption<Json.Json> = $f(
  AsyncStorageFP.getItem,
  TO.fromTaskEither,
  TO.chainOptionK(O.fromNullable),
  TO.chainEitherK(Json.parse),
)

const set: (
  key: string,
) => (value: unknown) => TE.TaskEither<unknown, void> = key =>
  $f(TE.fromEitherK(Json.stringify), TE.chain(AsyncStorageFP.setItem(key)))

const remove: (key: string) => TE.TaskEither<void, void> = $f(
  AsyncStorageFP.removeItem,
)

export const SimpleStorage = {
  get,
  set,
  remove,
}
