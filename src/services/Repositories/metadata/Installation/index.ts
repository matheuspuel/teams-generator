import { Effect } from 'fp'

export type InstallationRepository = {
  get: () => Effect<never, unknown, { id: string }>
  set: (value: { id: string }) => Effect<never, unknown, void>
}
