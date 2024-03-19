import { Schema } from '@effect/schema'
import { createStorage } from 'src/utils/storage'
import { Repository } from '../..'

export const StorageVersionRepositoryLive: Repository['metadata']['StorageVersion'] =
  createStorage({
    key: 'telemetry/StorageVersion',
    schema: Schema.struct({ version: Schema.number }),
  })
