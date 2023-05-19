import { $f, Num, Optic, Ord } from 'fp'
import { root } from 'src/model/Optics'
import { modifySApp } from 'src/services/StateRef'
import { toggle } from 'src/utils/fp/boolean'
import { decrement, increment } from 'src/utils/fp/number'

const params = root.parameters

export const getParameters = Optic.get(params.$)

export const togglePosition = modifySApp(params.position.$)(toggle)

export const toggleRating = modifySApp(params.rating.$)(toggle)

const teamsCountClamp = Ord.clamp(Num.Order)(2, 9)

export const incrementTeamsCount = modifySApp(params.teamsCount.$)(
  $f(increment, teamsCountClamp),
)

export const decrementTeamsCount = modifySApp(params.teamsCount.$)(
  $f(decrement, teamsCountClamp),
)
