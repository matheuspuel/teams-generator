import { Effect } from 'fp'

export type StorageVersionRepository = {
  get: () => Effect<never, unknown, { version: number }>
  set: (value: { version: number }) => Effect<never, unknown, void>
}
