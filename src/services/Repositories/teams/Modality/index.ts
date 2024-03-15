import { Effect } from 'fp'
import { CustomModality } from 'src/datatypes/Modality'

export type ModalityRepository = {
  get: () => Effect<ReadonlyArray<CustomModality>, unknown>
  set: (value: ReadonlyArray<CustomModality>) => Effect<void, unknown>
}
