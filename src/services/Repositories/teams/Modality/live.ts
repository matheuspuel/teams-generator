import { Schema } from '@effect/schema'
import { Modality } from 'src/datatypes'
import { createStorage } from 'src/utils/storage'
import { ModalityRepository } from '.'

export const ModalityRepositoryLive: ModalityRepository = createStorage({
  key: 'core/Modality',
  schema: Schema.array(Modality.CustomModality),
})
