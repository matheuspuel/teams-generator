import cuid from 'cuid'
import { $, D, IO } from 'fp'
import { Branded } from 'io-ts'
import { NonEmptyString } from './String'

export type Id = Branded<NonEmptyString, IdBrand>
type IdBrand = { readonly Id: unique symbol }

export const IdFromString: D.Decoder<string, Id> = D.fromRefinement(
  (v): v is Id => true,
  'Id',
)

export const Id: D.Decoder<unknown, Id> = $(D.string, D.compose(IdFromString))

export const getId: <A extends { id: unknown }>(a: A) => A['id'] = a => a.id

export const getTimestamp: <A extends { timestamp: number }>(
  a: A,
) => number = a => a.timestamp

export const generateId: IO<Id> = () => cuid() as Id
