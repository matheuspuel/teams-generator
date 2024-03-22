import { Schema } from '@effect/schema'
import { createStorage } from 'src/utils/storage'
import { StorageVersionRepository } from '.'

export const StorageVersionRepositoryLive: StorageVersionRepository =
  createStorage({
    key: 'telemetry/StorageVersion',
    schema: Schema.struct({ version: Schema.number }),
  })
