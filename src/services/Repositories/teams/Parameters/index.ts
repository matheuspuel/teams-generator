import { Effect } from 'fp'
import { Parameters } from 'src/datatypes'

export type ParameterRepository = {
  get: () => Effect<Parameters, unknown>
  set: (value: Parameters) => Effect<void, unknown>
}
