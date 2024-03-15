/* eslint-disable functional/functional-parameters */
import * as Context from 'effect/Context'
import { Effect } from 'effect/Effect'
import { F } from 'src/utils/fp'

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
  get: () => Effect<Metadata>
}

export class MetadataServiceEnv extends Context.Tag('MetadataService')<
  MetadataServiceEnv,
  MetadataService
>() {}

export const Metadata = F.serviceFunctions(MetadataServiceEnv)
