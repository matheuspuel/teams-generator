import { Effect } from 'fp'

type EventLeaf<R, A> = (payload: A) => Effect<R, never, void>

export type AnyEventTree = {
  [k: string]: EventLeaf<unknown, never> | AnyEventTree
}

type FlattenTree<T extends AnyEventTree> = {
  [k in keyof T & string]: T[k] extends EventLeaf<unknown, never>
    ? T[k]
    : T[k] extends AnyEventTree
    ? FlattenTree<T[k]>
    : never
}[keyof T & string]

export type EventEnvFromTree<S extends AnyEventTree> = Effect.Context<
  ReturnType<FlattenTree<S>>
>
