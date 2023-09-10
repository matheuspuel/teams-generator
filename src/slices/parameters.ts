import { Match, Num, Optic, Ord, apply, flow, modify, pipe } from 'fp'
import { MINIMUM_NUMBER_OF_TEAMS, Parameters } from 'src/datatypes/Parameters'
import { root } from 'src/model/optic'
import { State } from 'src/services/StateRef'
import { toggle } from 'src/utils/fp/boolean'
import { decrement, increment } from 'src/utils/fp/number'

const params = root.at('parameters')

export const getParameters = Optic.get(params)

export const togglePosition = State.on(params.at('position')).update(toggle)

export const toggleRating = State.on(params.at('rating')).update(toggle)

const teamsCountClamp = Ord.clamp(Num.Order)(MINIMUM_NUMBER_OF_TEAMS, 9)

const playersRequiredClamp = Ord.clamp(Num.Order)(2, 99)

export const incrementTeamsCount = State.on(params).update(p =>
  pipe(
    p.teamsCountMethod,
    Match.valueTags({
      count: () =>
        modify(Optic.id<Parameters>().at('teamsCount'))(
          flow(increment, teamsCountClamp),
        ),
      playersRequired: () =>
        modify(Optic.id<Parameters>().at('playersRequired'))(
          flow(increment, playersRequiredClamp),
        ),
    }),
    apply(p),
  ),
)

export const decrementTeamsCount = State.on(params).update(p =>
  pipe(
    p.teamsCountMethod,
    Match.valueTags({
      count: () =>
        modify(Optic.id<Parameters>().at('teamsCount'))(
          flow(decrement, teamsCountClamp),
        ),
      playersRequired: () =>
        modify(Optic.id<Parameters>().at('playersRequired'))(
          flow(decrement, playersRequiredClamp),
        ),
    }),
    apply(p),
  ),
)
