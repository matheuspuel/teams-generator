import { Schema } from '@effect/schema'
import { Effect, Option, flow, identity, pipe } from 'effect'
import { SimpleStorage } from './simpleStorage'

export type Storage<A> = {
  get: () => Effect.Effect<A, unknown>
  set: (value: A) => Effect.Effect<void, unknown>
  remove: () => Effect.Effect<void, void>
  setOrRemove: (value: Option.Option<A>) => Effect.Effect<void, unknown>
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
  setOrRemove: flow(
    Option.match({
      onNone: () => SimpleStorage.remove(key),
      onSome: flow(
        Schema.encodeEither(schema),
        Effect.flatMap(SimpleStorage.set(key)),
      ),
    }),
  ),
})
