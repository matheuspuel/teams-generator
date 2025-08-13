import { Schema } from 'effect'
import { createStorage } from 'src/utils/storage'
import { PreferencesRepository } from '.'

export class Preferences extends Schema.Class<Preferences>('Preferences')({
  isRatingVisible: Schema.Boolean,
}) {}

export const PreferencesRepositoryLive: PreferencesRepository = createStorage({
  key: 'core/preferences',
  schema: Preferences,
})
