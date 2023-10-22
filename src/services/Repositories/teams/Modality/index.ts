import { Effect } from 'fp'
import { CustomModality } from 'src/datatypes/Modality'

export type ModalityRepository = {
  get: () => Effect<never, unknown, ReadonlyArray<CustomModality>>
  set: (value: ReadonlyArray<CustomModality>) => Effect<never, unknown, void>
}
