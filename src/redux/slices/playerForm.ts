import { Player, Rating } from 'src/datatypes/Player'
import { Position } from 'src/datatypes/Position'
import { RootOptic } from '..'

export const PlayerFormLens = RootOptic.at('playerForm')

export type PlayerForm = { name: string; position: Position; rating: Rating }

export const blankPlayerForm: PlayerForm = {
  name: '',
  position: 'A',
  rating: 5,
}

const getFormFromData = ({ name, position, rating }: Player): PlayerForm => ({
  name,
  position,
  rating,
})
