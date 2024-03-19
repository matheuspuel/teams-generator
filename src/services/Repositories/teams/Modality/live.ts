import { Schema } from '@effect/schema'
import { Modality } from 'src/datatypes'
import { createStorage } from 'src/utils/storage'
import { Repository } from '../..'

export const ModalityRepositoryLive: Repository['teams']['Modality'] =
  createStorage({
    key: 'core/Modality',
    schema: Schema.array(Modality.CustomModality),
  })
