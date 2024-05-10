import { Schema } from '@effect/schema'
import { toFixedLocale } from 'src/utils/Number'

export const List = [
  0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9,
  9.5, 10,
] as const

export type Rating = (typeof List)[number]

export const Rating: Schema.Schema<Rating> = Schema.Literal(...List)

export const toString: (rating: Rating) => string = r =>
  r === 10 ? r.toString() : toFixedLocale(1)(r)
