import { Modality, Player, Rating } from 'src/datatypes'
import { basketball, futsal, soccer, volleyball } from 'src/datatypes/Modality'
import { Abbreviation } from 'src/datatypes/Position'

export type PlayerForm = {
  name: string
  positionAbbreviation: Abbreviation
  rating: Rating
}

export const blankPlayerForm = (args: { modality: Modality }): PlayerForm => ({
  name: '',
  positionAbbreviation:
    args.modality._tag === 'StaticModality'
      ? args.modality.id === soccer.id
        ? soccer.positions[6].abbreviation
        : args.modality.id === futsal.id
        ? futsal.positions[4].abbreviation
        : args.modality.id === volleyball.id
        ? volleyball.positions[0].abbreviation
        : args.modality.id === basketball.id
        ? basketball.positions[4].abbreviation
        : args.modality.positions[0].abbreviation
      : args.modality.positions[0].abbreviation,
  rating: 5,
})

export const getPlayerFormFromData = ({
  name,
  positionAbbreviation,
  rating,
}: Player): PlayerForm => ({
  name,
  positionAbbreviation,
  rating,
})
