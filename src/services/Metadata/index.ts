/* eslint-disable functional/functional-parameters */
import * as Context from '@effect/data/Context'
import { Effect } from '@effect/io/Effect'
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
}

export type MetadataService = {
  get: Effect<never, never, Metadata>
}

export type MetadataEnv = { Metadata: MetadataService }

export const MetadataEnv = Context.Tag<MetadataEnv>()

export const Metadata = {
  get: F.flatMap(MetadataEnv, env => env.Metadata.get),
}
