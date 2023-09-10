import { Effect, F, Json, O, flow } from 'fp'
import { AsyncStorageFP } from './wrapper'

const get: (key: string) => Effect<never, unknown, Json.Json> = flow(
  AsyncStorageFP.getItem,
  F.flatMap(O.fromNullable),
  F.flatMap(Json.parse),
)

const set: (
  key: string,
) => (value: unknown) => Effect<never, unknown, void> = key =>
  flow(Json.stringify, F.flatMap(AsyncStorageFP.setItem(key)))

const remove: (key: string) => Effect<never, void, void> =
  AsyncStorageFP.removeItem

export const SimpleStorage = {
  get,
  set,
  remove,
}
