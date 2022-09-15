import { flow } from 'fp-ts/lib/function'
import { Json, O, TE, TO } from 'src/utils/fp-ts'
import { JSONFP } from '../json/wrapper'
import { AsyncStorageFP } from './wrapper'

const get: (key: string) => TO.TaskOption<Json.Json> = flow(
  AsyncStorageFP.getItem,
  TO.fromTaskEither,
  TO.chainOptionK(O.fromNullable),
  TO.chainEitherK(tt.JsonFromString.decode),
)
Json.parse

const set: (
  key: string,
) => (value: unknown) => TE.TaskEither<void, void> = key =>
  flow(
    JSONFP.stringify, //
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
