import { Schema } from 'effect'
import { createStorage } from 'src/utils/storage'
import type { StorageVersionRepository } from '.'

export const StorageVersionRepositoryLive: StorageVersionRepository =
  createStorage({
    key: 'telemetry/StorageVersion',
    schema: Schema.Struct({ version: Schema.Number }),
  })
