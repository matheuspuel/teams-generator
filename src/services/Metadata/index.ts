import { Effect } from 'effect'

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

export type MetadataServiceImplementation = {
  get: () => Effect.Effect<Metadata>
}

export class MetadataService extends Effect.Tag('MetadataService')<
  MetadataService,
  MetadataServiceImplementation
>() {}
