import { Schema } from '@effect/schema'
import { Effect, Option, flow } from 'effect'
import { AsyncStorageFP } from './wrapper'

const get: (key: string) => Effect.Effect<unknown, unknown> = flow(
  AsyncStorageFP.getItem,
  Effect.flatMap(Option.fromNullable),
  Effect.flatMap(Schema.decode(Schema.parseJson())),
)

const set: (
  key: string,
) => (value: unknown) => Effect.Effect<void, unknown> = key =>
  flow(
    Schema.encode(Schema.parseJson()),
    Effect.flatMap(AsyncStorageFP.setItem(key)),
  )

const remove: (key: string) => Effect.Effect<void, void> =
  AsyncStorageFP.removeItem

export const SimpleStorage = {
  get,
  set,
  remove,
}
