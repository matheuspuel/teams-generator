import * as Optic from '@fp-ts/optic'
import { Match, Number, Order, flow, pipe } from 'effect'
import { apply } from 'effect/Function'
import { MINIMUM_NUMBER_OF_TEAMS, Parameters } from 'src/datatypes/Parameters'
import { root } from 'src/model/optic'
import { State } from 'src/services/StateRef'
import { toggle } from 'src/utils/fp/Boolean'
import { decrement, increment } from 'src/utils/fp/Number'

const params = root.at('parameters')

export const getParameters = Optic.get(params)

export const togglePosition = State.on(params.at('position')).update(toggle)

export const toggleRating = State.on(params.at('rating')).update(toggle)

const teamsCountClamp = Order.clamp(Number.Order)({
  minimum: MINIMUM_NUMBER_OF_TEAMS,
  maximum: 99,
})

const playersRequiredClamp = Order.clamp(Number.Order)({
  minimum: 2,
  maximum: 99,
})

export const incrementTeamsCount = State.on(params).update(p =>
  pipe(
    p.teamsCountMethod,
    Match.valueTags({
      count: () =>
        Optic.modify(Optic.id<Parameters>().at('teamsCount'))(
          flow(increment, teamsCountClamp),
        ),
      playersRequired: () =>
        Optic.modify(Optic.id<Parameters>().at('playersRequired'))(
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
        Optic.modify(Optic.id<Parameters>().at('teamsCount'))(
          flow(decrement, teamsCountClamp),
        ),
      playersRequired: () =>
        Optic.modify(Optic.id<Parameters>().at('playersRequired'))(
          flow(decrement, playersRequiredClamp),
        ),
    }),
    apply(p),
  ),
)
