export * from 'fp-ts/Json'
import { flow as $f } from '@effect/data/Function'
import * as Json_ from 'fp-ts/Json'
import * as E from './Either'

export const stringify = $f(Json_.stringify, E.fromFpTs)

export const parse = $f(Json_.parse, E.fromFpTs)
