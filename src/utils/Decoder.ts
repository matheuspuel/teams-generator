/* eslint-disable @typescript-eslint/no-unused-vars */
import { flow } from 'fp-ts/lib/function'
import { Option } from 'fp-ts/lib/Option'
import * as DE from 'io-ts/lib/DecodeError'
import {
  DecodeError,
  Decoder,
  fromRefinement,
  literal,
  struct,
  union,
} from 'io-ts/lib/Decoder'
import { E, O } from 'src/utils/fp-ts'

const getErrorType: (e: DE.DecodeError<string>) => string = DE.fold({
  Leaf: (input, error) => error,
  Key: (key, kind, errors) => `${kind} property ${JSON.stringify(key)}`,
  Index: (index, kind, errors) => `${kind} index ${index}`,
  Member: (index, errors) => `member ${index}`,
  Lazy: (id, errors) => `lazy type ${id}`,
  Wrap: (error, errors) => error,
})

export const toErrorTypeArray = (e: DecodeError): ReadonlyArray<string> => {
  const stack = []
  let focus = e
  const res = []
  // eslint-disable-next-line no-constant-condition
  while (true) {
    switch (focus._tag) {
      case 'Of': {
        res.push(getErrorType(focus.value))
        const tmp = stack.pop()
        if (tmp === undefined) {
          return res
        } else {
          focus = tmp
        }
        break
      }
      case 'Concat': {
        stack.push(focus.right)
        focus = focus.left
        break
      }
    }
  }
}

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
