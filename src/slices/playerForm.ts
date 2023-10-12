import { Player, Rating } from 'src/datatypes'
import { Modality } from 'src/datatypes/Modality'
import { Id } from 'src/utils/Entity'

export type PlayerForm = { name: string; positionId: Id; rating: Rating }

export const blankPlayerForm = (args: { modality: Modality }): PlayerForm => ({
  name: '',
  positionId: args.modality.positions[0].id,
  rating: 5,
})

export const getPlayerFormFromData = ({
  name,
  positionId,
  rating,
}: Player): PlayerForm => ({
  name,
  positionId,
  rating,
})
