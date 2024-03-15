import { Effect } from 'fp'

export type InstallationRepository = {
  get: () => Effect<{ id: string }, unknown>
  set: (value: { id: string }) => Effect<void, unknown>
}
