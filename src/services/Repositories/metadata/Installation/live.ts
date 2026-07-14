import { Schema } from 'effect'
import { createStorage } from 'src/utils/storage'
import type { InstallationRepository } from '.'

export const InstallationRepositoryLive: InstallationRepository = createStorage<
  { id: string },
  { id: string }
>({
  key: 'telemetry/installation',
  schema: Schema.Struct({ id: Schema.String }),
})
