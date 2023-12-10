import { S } from 'fp'
import { createStorage } from 'src/utils/storage'
import { Repository } from '../..'

export const InstallationRepositoryLive: Repository['metadata']['Installation'] =
  createStorage<{ id: string }, { id: string }>({
    key: 'telemetry/installation',
    schema: S.struct({ id: S.string }),
  })
