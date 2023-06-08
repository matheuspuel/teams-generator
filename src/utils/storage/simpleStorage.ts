import { $f, E, Eff, Effect, Json, O } from 'fp'
import * as E_ from 'fp-ts/Either'
import { AsyncStorageFP } from './wrapper'

const get: (key: string) => Effect<never, unknown, Json.Json> = $f(
  AsyncStorageFP.getItem,
  Eff.map(O.fromNullable),
  Eff.someOrFailException,
  Eff.flatMap($f(Json.parse, E_.matchW(E.left, E.right))),
)

const set: (
  key: string,
) => (value: unknown) => Effect<never, unknown, void> = key =>
  $f(
    Json.stringify,
    E_.matchW(E.left, E.right),
    Eff.flatMap(AsyncStorageFP.setItem(key)),
  )

const remove: (key: string) => Effect<never, void, void> = $f(
  AsyncStorageFP.removeItem,
)

export const SimpleStorage = {
  get,
  set,
  remove,
}
