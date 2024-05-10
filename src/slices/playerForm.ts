import { Modality, Player, Rating } from 'src/datatypes'
import {
  basketball,
  basketballPositions,
  futsal,
  futsalPositions,
  soccer,
  soccerPositions,
  volleyball,
  volleyballPositions,
} from 'src/datatypes/Modality'
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
        ? soccerPositions.a.abbreviation
        : args.modality.id === futsal.id
          ? futsalPositions.p.abbreviation
          : args.modality.id === volleyball.id
            ? volleyballPositions.l.abbreviation
            : args.modality.id === basketball.id
              ? basketballPositions.c.abbreviation
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
