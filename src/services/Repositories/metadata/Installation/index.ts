import { Effect } from 'effect'

export type InstallationRepository = {
  get: () => Effect.Effect<{ id: string }, unknown>
  set: (value: { id: string }) => Effect.Effect<void, unknown>
}
