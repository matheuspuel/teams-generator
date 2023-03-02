import { $, $f, O, TE, TO } from 'fp'
import { Decoder } from 'io-ts/lib/Decoder'
import { SimpleStorage } from './simpleStorage'

export type Storage<A> = {
  get: TO.TaskOption<A>
  set: (value: A) => TE.TaskEither<unknown, void>
  remove: TE.TaskEither<void, void>
  setOrRemove: (value: O.Option<A>) => TE.TaskEither<unknown, void>
}

export const createStorage: <A>(args: {
  key: string
  decoder: Decoder<unknown, A>
}) => Storage<A> = ({ key, decoder }) => ({
  get: $(key, SimpleStorage.get, TO.chainEitherK(decoder.decode)),
  set: SimpleStorage.set(key),
  remove: SimpleStorage.remove(key),
  setOrRemove: $f(
    O.match(() => SimpleStorage.remove(key), SimpleStorage.set(key)),
  ),
})
