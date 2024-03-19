import { Effect } from 'effect'

export type StorageVersionRepository = {
  get: () => Effect.Effect<{ version: number }, unknown>
  set: (value: { version: number }) => Effect.Effect<void, unknown>
}
