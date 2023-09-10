export * from 'fp-ts/Json'
import { flow } from '@effect/data/Function'
import * as Json_ from 'fp-ts/Json'
import * as E from './Either'

export const stringify = flow(Json_.stringify, E.fromFpTs)

export const parse = flow(Json_.parse, E.fromFpTs)
