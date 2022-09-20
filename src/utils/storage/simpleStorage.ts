import { flow } from 'fp-ts/lib/function'
import { Json, O, TE, TO } from 'src/utils/fp-ts'
import { AsyncStorageFP } from './wrapper'

const get: (key: string) => TO.TaskOption<Json.Json> = flow(
  AsyncStorageFP.getItem,
  TO.fromTaskEither,
  TO.chainOptionK(O.fromNullable),
  TO.chainEitherK(Json.parse),
)

const set: (
  key: string,
) => (value: unknown) => TE.TaskEither<unknown, void> = key =>
  flow(
    Json.stringify, //
    TE.fromEither,
    TE.chain(AsyncStorageFP.setItem(key)),
  )

const remove: (key: string) => TE.TaskEither<void, void> = flow(
  AsyncStorageFP.removeItem,
)

export const SimpleStorage = {
  get,
  set,
  remove,
}
