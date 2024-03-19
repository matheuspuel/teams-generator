import { Effect } from 'effect'
import * as Context from 'effect/Context'

export type Metadata = {
  installation: { id: string }
  launch: { id: string }
  isFirstLaunch: boolean
  device: {
    modelName: string | null
    osVersion: string | null
    platformApiLevel: number | null
  }
  application: {
    version: string
    native: {
      version: string | null
      buildVersion: string | null
    }
  }
  preferences: {
    languageCode: string | null
    regionCode: string | null
  }
}

export type MetadataService = {
  get: () => Effect.Effect<Metadata>
}

export class MetadataServiceEnv extends Context.Tag('MetadataService')<
  MetadataServiceEnv,
  MetadataService
>() {}

export const Metadata = Effect.serviceFunctions(MetadataServiceEnv)
