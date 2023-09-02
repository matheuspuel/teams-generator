import { $, $f, Match, Num, Optic, Ord, apply, modify } from 'fp'
import { MINIMUM_NUMBER_OF_TEAMS, Parameters } from 'src/datatypes/Parameters'
import { root } from 'src/model/optic'
import { modifySApp } from 'src/services/StateRef'
import { toggle } from 'src/utils/fp/boolean'
import { decrement, increment } from 'src/utils/fp/number'

const params = root.at('parameters')

export const getParameters = Optic.get(params)

export const togglePosition = modifySApp(params.at('position'))(toggle)

export const toggleRating = modifySApp(params.at('rating'))(toggle)

const teamsCountClamp = Ord.clamp(Num.Order)(MINIMUM_NUMBER_OF_TEAMS, 9)

const playersRequiredClamp = Ord.clamp(Num.Order)(2, 99)

export const incrementTeamsCount = modifySApp(params)(p =>
  $(
    p.teamsCountMethod,
    Match.valueTags({
      count: () =>
        modify(Optic.id<Parameters>().at('teamsCount'))(
          $f(increment, teamsCountClamp),
        ),
      playersRequired: () =>
        modify(Optic.id<Parameters>().at('playersRequired'))(
          $f(increment, playersRequiredClamp),
        ),
    }),
    apply(p),
  ),
)

export const decrementTeamsCount = modifySApp(params)(p =>
  $(
    p.teamsCountMethod,
    Match.valueTags({
      count: () =>
        modify(Optic.id<Parameters>().at('teamsCount'))(
          $f(decrement, teamsCountClamp),
        ),
      playersRequired: () =>
        modify(Optic.id<Parameters>().at('playersRequired'))(
          $f(decrement, playersRequiredClamp),
        ),
    }),
    apply(p),
  ),
)
