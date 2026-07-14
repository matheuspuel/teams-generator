import type { Effect } from 'effect'
import type { CustomModality } from 'src/datatypes/Modality'

export type ModalityRepository = {
  get: () => Effect.Effect<ReadonlyArray<CustomModality>, unknown>
  set: (value: ReadonlyArray<CustomModality>) => Effect.Effect<void, unknown>
}
