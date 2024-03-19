import { Effect } from 'effect'
import { CustomModality } from 'src/datatypes/Modality'

export type ModalityRepository = {
  get: () => Effect.Effect<ReadonlyArray<CustomModality>, unknown>
  set: (value: ReadonlyArray<CustomModality>) => Effect.Effect<void, unknown>
}
