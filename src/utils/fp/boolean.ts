import { Endomorphism } from 'fp-ts/Endomorphism'
export * from '@effect/data/Boolean'

export const toggle: Endomorphism<boolean> = value => !value
