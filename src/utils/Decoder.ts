/* eslint-disable @typescript-eslint/no-unused-vars */
import { flow } from 'fp-ts/lib/function'
import { Option } from 'fp-ts/lib/Option'
import {
  Decoder,
  fromRefinement,
  literal,
  struct,
  union,
} from 'io-ts/lib/Decoder'
import { E, O } from 'src/utils/fp-ts'

export const undefinedDecoder = fromRefinement(
  (v): v is undefined => v === undefined,
  'undefined',
)

export const optionFromNullable = <A>(
  decoder: Decoder<unknown, A>,
): Decoder<unknown, Option<NonNullable<A>>> => ({
  decode: flow(
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
