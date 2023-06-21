import { Effect } from 'fp'

export type installation = {
  get: Effect<never, unknown, { id: string }>
  set: (value: { id: string }) => Effect<never, unknown, void>
}
