import { Endomorphism } from 'fp-ts/Endomorphism'
export * from 'effect/Boolean'

export const toggle: Endomorphism<boolean> = value => !value
