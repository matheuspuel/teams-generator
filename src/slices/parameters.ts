import { $, $f, Num, Optic, Ord, apply, modify } from 'fp'
import { Parameters } from 'src/datatypes/Parameters'
import { root } from 'src/model/Optics'
import { modifySApp } from 'src/services/StateRef'
import { matchTag } from 'src/utils/Tagged'
import { toggle } from 'src/utils/fp/boolean'
import { decrement, increment } from 'src/utils/fp/number'

const params = root.parameters

export const getParameters = Optic.get(params.$)

export const togglePosition = modifySApp(params.position.$)(toggle)

export const toggleRating = modifySApp(params.rating.$)(toggle)

const teamsCountClamp = Ord.clamp(Num.Ord)(2, 9)

const playersRequiredClamp = Ord.clamp(Num.Ord)(2, 99)

export const incrementTeamsCount = modifySApp(params.$)(p =>
  $(
    p.teamsCountMethod,
    matchTag({
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

export const decrementTeamsCount = modifySApp(params.$)(p =>
  $(
    p.teamsCountMethod,
    matchTag({
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
