import { Effect } from 'fp'
import { Modality } from 'src/datatypes'

export type ModalityRepository = {
  get: () => Effect<never, unknown, ReadonlyArray<Modality>>
  set: (value: ReadonlyArray<Modality>) => Effect<never, unknown, void>
}
