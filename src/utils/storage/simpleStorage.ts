import { Effect, F, O, S, flow } from 'fp'
import { AsyncStorageFP } from './wrapper'

const get: (key: string) => Effect<unknown, unknown> = flow(
  AsyncStorageFP.getItem,
  F.flatMap(O.fromNullable),
  F.flatMap(S.decode(S.parseJson())),
)

const set: (key: string) => (value: unknown) => Effect<void, unknown> = key =>
  flow(S.encode(S.parseJson()), F.flatMap(AsyncStorageFP.setItem(key)))

const remove: (key: string) => Effect<void, void> = AsyncStorageFP.removeItem

export const SimpleStorage = {
  get,
  set,
  remove,
}
