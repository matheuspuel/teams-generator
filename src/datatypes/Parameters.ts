import { D } from 'fp'

export type Parameters = {
  teamsCount: number
  position: boolean
  rating: boolean
}

export const Parameters: D.Schema<Parameters> = D.struct({
  teamsCount: D.number,
  position: D.boolean,
  rating: D.boolean,
})

export const defaultParameters: Parameters = {
  teamsCount: 2,
  position: true,
  rating: true,
}
