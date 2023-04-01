import { Endomorphism } from 'fp-ts/Endomorphism'
export * from 'fp-ts/boolean'

export const toggle: Endomorphism<boolean> = value => !value
