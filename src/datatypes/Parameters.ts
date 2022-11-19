import { D } from 'src/utils/fp-ts'

export type Parameters = {
  teamsCount: number
  position: boolean
  rating: boolean
}

export const Parameters: D.Decoder<unknown, Parameters> = D.struct({
  teamsCount: D.number,
  position: D.boolean,
  rating: D.boolean,
})

export const defaultParameters: Parameters = {
  teamsCount: 2,
  position: true,
  rating: true,
}
