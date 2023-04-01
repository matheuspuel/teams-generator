import { Num, Optic, Ord } from 'fp'
import { root } from 'src/model/Optics'
import { modifySApp } from 'src/services/StateRef'

const teamsCountClamp = Ord.clamp(Num.Ord)(2, 8)

const modify = modifySApp(root.parameters.$)

export const getParameters = Optic.get(root.parameters.$)

export const togglePosition = modify(s => ({ ...s, position: !s.position }))

export const toggleRating = modify(s => ({ ...s, rating: !s.rating }))

export const incrementTeamsCount = modify(s => ({
  ...s,
  teamsCount: teamsCountClamp(s.teamsCount + 1),
}))

export const decrementTeamsCount = modify(s => ({
  ...s,
  teamsCount: teamsCountClamp(s.teamsCount - 1),
}))
