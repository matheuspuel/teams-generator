import { Form } from '@matheuspuel/state-machine'
import { makeStateMachineContext } from '@matheuspuel/state-machine/react'
import { Option, pipe, Schema } from 'effect'
import { Rating } from 'src/datatypes'
import { Abbreviation } from 'src/datatypes/Position'

const playerFormStateMachine = Form.Struct({
  name: Form.Field.TrimNonEmptyString,
  positionAbbreviation: Form.Field.of(Abbreviation.make('a')),
  rating: Form.Field.of<Rating>(5).mapActions(actions => ({
    ...actions,
    setFromPercentage: (percentage: number) => {
      const rating = pipe(
        Math.round(percentage * 20) / 2,
        Schema.decodeUnknownOption(Rating.Rating),
        Option.getOrNull,
      )
      if (rating === null) return
      actions.set(rating)
    },
  })),
})

export const PlayerForm = makeStateMachineContext(playerFormStateMachine)
