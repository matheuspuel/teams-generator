import { $, Effect, Rec } from 'fp'

export type Event<T extends string = string, P = unknown> = {
  _tag: 'Event'
  event: { _tag: T; payload: P }
}

const makeEvent =
  <T extends string>(tag: T) =>
  <P>(payload: P): Event<T, P> => ({
    _tag: 'Event',
    event: { _tag: tag, payload },
  })

type HandleEventLeaf<R, A> = (payload: A) => Effect<R, never, void>

export type AnyHandleEventTree = {
  [k: string]: HandleEventLeaf<unknown, never> | AnyHandleEventTree
}

export type EventFromTree<
  T extends AnyHandleEventTree,
  C extends string = '',
> = {
  [k in keyof T & string]: T[k] extends HandleEventLeaf<unknown, infer A>
    ? Event<`${C}${k}`, A>
    : T[k] extends AnyHandleEventTree
    ? EventFromTree<T[k], `${C}${k}.`>
    : never
}[keyof T & string]

export type EventConstructorsFromTreeNotWiden<
  T extends AnyHandleEventTree,
  C extends string = '',
> = {
  [k in keyof T & string]: T[k] extends HandleEventLeaf<unknown, infer A>
    ? (payload: A) => Event<`${C}${k}`, A>
    : T[k] extends AnyHandleEventTree
    ? EventConstructorsFromTreeNotWiden<T[k], `${C}${k}.`>
    : never
}

type EventConstructorsFromTreeRec<
  T extends AnyHandleEventTree,
  C extends string,
  E extends Event,
> = {
  [k in keyof T & string]: T[k] extends HandleEventLeaf<unknown, infer A>
    ? (payload: A) => E
    : T[k] extends AnyHandleEventTree
    ? EventConstructorsFromTreeRec<T[k], `${C}${k}.`, E>
    : never
}

export type EventConstructorsFromTree<
  T extends AnyHandleEventTree,
  E extends EventFromTree<T>,
> = EventConstructorsFromTreeRec<T, '', E>

export const makeEventConstructors =
  <T extends AnyHandleEventTree>(tree: T) =>
  <E extends EventFromTree<T>>(): EventConstructorsFromTree<T, E> => {
    const rec =
      (tree: T) =>
      (prefix: string): unknown =>
        $(
          tree,
          Rec.map((v, k) =>
            typeof v === 'function'
              ? makeEvent(prefix + k)
              : // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
                rec(v as any)(prefix + k + '.'),
          ),
        )
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
    return rec(tree)('') as any
  }

type FlattenTree<T extends AnyHandleEventTree> = {
  [k in keyof T & string]: T[k] extends HandleEventLeaf<unknown, never>
    ? T[k]
    : T[k] extends AnyHandleEventTree
    ? FlattenTree<T[k]>
    : never
}[keyof T & string]

export type EventHandlerEnvFromTree<S extends AnyHandleEventTree> =
  Effect.Context<ReturnType<FlattenTree<S>>>

type EventHandlerR<R, E extends Event> = (event: E) => Effect<R, never, void>

export const makeEventHandler = <T extends AnyHandleEventTree>(
  tree: T,
): EventHandlerR<EventHandlerEnvFromTree<T>, EventFromTree<T>> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const indexed: Record<string, any> = {}
  const rec =
    (tree: AnyHandleEventTree) =>
    (prefix: string): unknown =>
      $(
        tree,
        Rec.map((v, k) =>
          typeof v === 'function'
            ? // eslint-disable-next-line functional/immutable-data
              (indexed[prefix + k] = v)
            : // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
              rec(v)(prefix + k + '.'),
        ),
      )
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any, functional/no-expression-statements
  rec(tree)('') as any
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-unsafe-call
  return ((e: Event) => indexed[e.event._tag]!(e.event.payload as any)) as any
}

export type EventHandler<E extends Event> = (
  event: E,
) => Effect<never, never, void>

export type EventHandlerEnv<E extends Event> = {
  eventHandler: EventHandler<E>
}
