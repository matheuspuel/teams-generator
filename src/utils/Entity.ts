import cuid from 'cuid'
import { IO } from './fp-ts'

export type Id = string

export const getId: <A extends { id: unknown }>(a: A) => A['id'] = a => a.id

export const getTimestamp: <A extends { timestamp: number }>(
  a: A,
) => number = a => a.timestamp

export const generateId: IO<Id> = () => cuid()
