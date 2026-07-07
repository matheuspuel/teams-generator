import { Effect, Schema, flow, identity, pipe } from 'effect'
import { SimpleStorage } from './simpleStorage'

export type Storage<A> = {
  get: () => Effect.Effect<A, unknown>
  set: (value: A) => Effect.Effect<void, unknown>
  remove: () => Effect.Effect<void, void>
}

export const createStorage: <A, I>(args: {
  key: string
  schema: Schema.Schema<A, I>
}) => Storage<A> = ({ key, schema }) => ({
  __EncodedType: identity,
  get: () =>
    pipe(
      key,
      SimpleStorage.get,
      Effect.flatMap(Schema.decodeUnknownEither(schema)),
    ),
  set: flow(
    Schema.encodeEither(schema),
    Effect.flatMap(SimpleStorage.set(key)),
  ),
  remove: () => SimpleStorage.remove(key),
})
