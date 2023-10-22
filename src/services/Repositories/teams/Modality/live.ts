import { Modality } from 'src/datatypes'
import { S } from 'src/utils/fp'
import { createStorage } from 'src/utils/storage'
import { Repository } from '../..'

export const ModalityRepositoryLive: Repository['teams']['Modality'] =
  createStorage({
    key: 'core/Modality',
    schema: S.array(Modality.CustomModality),
  })
