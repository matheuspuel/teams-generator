import { S } from 'fp'
import { createStorage } from 'src/utils/storage'
import { Repository } from '../..'

export const StorageVersionRepositoryLive: Repository['metadata']['StorageVersion'] =
  createStorage({
    key: 'telemetry/StorageVersion',
    schema: S.struct({ version: S.number }),
  })
