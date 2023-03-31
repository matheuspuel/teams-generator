import { D } from 'fp'

export type Parameters = {
  teamsCount: number
  position: boolean
  rating: boolean
}

export const Schema: D.Schema<Parameters> = D.struct({
  teamsCount: D.number,
  position: D.boolean,
  rating: D.boolean,
})

export const Parameters = Schema

export const initial: Parameters = {
  teamsCount: 2,
  position: true,
  rating: true,
}
