/* eslint-disable @typescript-eslint/no-unused-vars */
import { $f, E, O, Option } from 'fp'
import {
  Decoder,
  fromRefinement,
  literal,
  struct,
  union,
} from 'io-ts/lib/Decoder'

export const undefinedDecoder = fromRefinement(
  (v): v is undefined => v === undefined,
  'undefined',
)

export const optionFromNullable = <A>(
  decoder: Decoder<unknown, A>,
): Decoder<unknown, Option<NonNullable<A>>> => ({
  decode: $f(
    union(undefinedDecoder, literal(null), decoder).decode,
    E.map(O.fromNullable),
  ),
})

const None = struct({ _tag: literal('None') })
const Some = <A>(decoder: Decoder<unknown, A>) =>
  struct({ _tag: literal('Some'), value: decoder })

export const option = <A>(
  decoder: Decoder<unknown, A>,
): Decoder<unknown, Option<A>> => union(None, Some(decoder))
