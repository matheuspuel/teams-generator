import type { Effect } from 'effect'
import type { Preferences } from './live'

export type PreferencesRepository = {
  get: () => Effect.Effect<Preferences, unknown>
  set: (value: Preferences) => Effect.Effect<void, unknown>
}
