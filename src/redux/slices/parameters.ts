import { Num, Ord } from 'fp'
import { Optic } from 'src/utils/Optic'
import { modifySApp, RootOptic } from '..'

export const ParametersLens = RootOptic.at('parameters')

const teamsCountClamp = Ord.clamp(Num.Ord)(2, 8)

const modify = modifySApp(ParametersLens)

export const getParameters = Optic.get(ParametersLens)

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
