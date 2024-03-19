import { Effect } from 'effect'
import { Parameters } from 'src/datatypes'

export type ParameterRepository = {
  get: () => Effect.Effect<Parameters, unknown>
  set: (value: Parameters) => Effect.Effect<void, unknown>
}
