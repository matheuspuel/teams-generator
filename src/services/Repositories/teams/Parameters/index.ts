import { Effect } from 'fp'
import { Parameters } from 'src/datatypes'

export type ParameterRepository = {
  get: () => Effect<never, unknown, Parameters>
  set: (value: Parameters) => Effect<never, unknown, void>
}