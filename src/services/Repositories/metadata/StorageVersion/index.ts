import { Effect } from 'fp'

export type StorageVersionRepository = {
  get: () => Effect<{ version: number }, unknown>
  set: (value: { version: number }) => Effect<void, unknown>
}
