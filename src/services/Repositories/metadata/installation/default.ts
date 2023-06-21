import { D } from 'fp'
import { createStorage } from 'src/utils/storage'
import { Repositories } from '../..'

export const defaultInstallationRepository: Repositories.metadata.installation =
  createStorage<{ id: string }, { id: string }>({
    key: 'telemetry/installation',
    schema: D.struct({ id: D.string }),
  })
