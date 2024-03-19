import { Schema } from '@effect/schema'
import { createStorage } from 'src/utils/storage'
import { Repository } from '../..'

export const InstallationRepositoryLive: Repository['metadata']['Installation'] =
  createStorage<{ id: string }, { id: string }>({
    key: 'telemetry/installation',
    schema: Schema.struct({ id: Schema.string }),
  })
