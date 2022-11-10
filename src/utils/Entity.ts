import cuid from 'cuid'
import { Branded } from 'io-ts'
import { IO } from './fp-ts'
import { NonEmptyString } from './String'

export type Id = Branded<NonEmptyString, IdBrand>
type IdBrand = { readonly Id: unique symbol }

export const getId: <A extends { id: unknown }>(a: A) => A['id'] = a => a.id

export const getTimestamp: <A extends { timestamp: number }>(
  a: A,
) => number = a => a.timestamp

export const generateId: IO<Id> = () => cuid() as Id
