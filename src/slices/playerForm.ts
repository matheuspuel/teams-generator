import { Player, Position, Rating } from 'src/datatypes'

export type PlayerForm = { name: string; position: Position; rating: Rating }

export const blankPlayerForm: PlayerForm = {
  name: '',
  position: 'A',
  rating: 5,
}

export const getPlayerFormFromData = ({
  name,
  position,
  rating,
}: Player): PlayerForm => ({
  name,
  position,
  rating,
})
