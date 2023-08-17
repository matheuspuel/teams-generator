import { $f, Eff, Effect, Json, O } from 'fp'
import { AsyncStorageFP } from './wrapper'

const get: (key: string) => Effect<never, unknown, Json.Json> = $f(
  AsyncStorageFP.getItem,
  Eff.flatMap(O.fromNullable),
  Eff.flatMap(Json.parse),
)

const set: (
  key: string,
) => (value: unknown) => Effect<never, unknown, void> = key =>
  $f(Json.stringify, Eff.flatMap(AsyncStorageFP.setItem(key)))

const remove: (key: string) => Effect<never, void, void> =
  AsyncStorageFP.removeItem

export const SimpleStorage = {
  get,
  set,
  remove,
}
