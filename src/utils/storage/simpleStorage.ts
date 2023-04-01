import { $f, Json, O, TE, TaskEither } from 'fp'
import { AsyncStorageFP } from './wrapper'

const get: (key: string) => TaskEither<unknown, Json.Json> = $f(
  AsyncStorageFP.getItem,
  TE.chainOptionK((): unknown => 'Empty')(O.fromNullable),
  TE.chainEitherK(Json.parse),
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
