import { flow, pipe } from 'fp-ts/lib/function'
import { Decoder } from 'io-ts/lib/Decoder'
import { O, TE, TO } from 'src/utils/fp-ts'
import { SimpleStorage } from './simpleStorage'

export interface Storage<A> {
  get: TO.TaskOption<A>
  set: (value: A) => TE.TaskEither<void, void>
  remove: TE.TaskEither<void, void>
  setOrRemove: (value: O.Option<A>) => TE.TaskEither<void, void>
}

export const createStorage: <A>(args: {
  key: string
  decoder: Decoder<unknown, A>
}) => Storage<A> = ({ key, decoder }) => ({
  get: pipe(key, SimpleStorage.get, TO.chainEitherK(decoder.decode)),
  set: SimpleStorage.set(key),
  remove: SimpleStorage.remove(key),
  setOrRemove: flow(
    O.match(() => SimpleStorage.remove(key), SimpleStorage.set(key)),
  ),
})
