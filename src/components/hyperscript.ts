import { Equal, Equivalence, flow } from 'effect'
import * as React from 'react'

type Endomorphism<A> = (_: A) => A

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
type AnySingleArgFunction<A> = <B>(arg: any) => A

type Element = React.ReactElement

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
type Arg<F extends <B>(arg: any) => unknown> = Parameters<F>[0]

export type UIComponent1 = AnySingleArgFunction<Element>

export type UIComponent2 = AnySingleArgFunction<UIComponent1>

export type UIComponent3 = AnySingleArgFunction<UIComponent2>

type UIUnderlyingComponent1<C extends UIComponent1> = (
  args: [Arg<C>],
) => Element

type UIUnderlyingComponent2<C extends UIComponent2> = (
  args: [Arg<C>, Arg<ReturnType<C>>],
) => Element

type UIUnderlyingComponent3<C extends UIComponent3> = (
  args: [Arg<C>, Arg<ReturnType<C>>, Arg<ReturnType<ReturnType<C>>>],
) => Element

const toUnderlying1 =
  <C extends UIComponent1>(component: C): UIUnderlyingComponent1<C> =>
  args =>
    component(args[0])

const toUnderlying2 =
  <C extends UIComponent2>(component: C): UIUnderlyingComponent2<C> =>
  args =>
    component(args[0])(args[1])

const toUnderlying3 =
  <C extends UIComponent3>(component: C): UIUnderlyingComponent3<C> =>
  args =>
    component(args[0])(args[1])(args[2])

const fromUnderlying1 = <C extends UIComponent1>(
  component: UIUnderlyingComponent1<C>,
): C =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  ((a1: Arg<C>) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    component([a1])) as any

const fromUnderlying2 = <C extends UIComponent2>(
  component: UIUnderlyingComponent2<C>,
): C =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  ((a1: Arg<C>) => (a2: Arg<ReturnType<C>>) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    component([a1, a2])) as any

const fromUnderlying3 = <C extends UIComponent3>(
  component: UIUnderlyingComponent3<C>,
): C =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  ((a1: Arg<C>) =>
    (a2: Arg<ReturnType<C>>) =>
    (a3: Arg<ReturnType<ReturnType<C>>>) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      component([a1, a2, a3])) as any

export const toElementCreator =
  <Args extends [...Array<unknown>]>(
    component: (args: Args) => Element,
  ): ((args: Args) => Element) =>
  // eslint-disable-next-line react/display-name
  args =>
    React.createElement(component, args)

export const transformUnderlyingComponent1 =
  <C extends UIComponent1>(component: C) =>
  (transformation: Endomorphism<UIUnderlyingComponent1<C>>): C =>
    fromUnderlying1(toElementCreator(transformation(toUnderlying1(component))))

export const transformUnderlyingComponent2 =
  <C extends UIComponent2>(component: C) =>
  (transformation: Endomorphism<UIUnderlyingComponent2<C>>): C =>
    fromUnderlying2(toElementCreator(transformation(toUnderlying2(component))))

export const transformUnderlyingComponent3 =
  <C extends UIComponent3>(component: C) =>
  (transformation: Endomorphism<UIUnderlyingComponent3<C>>): C =>
    fromUnderlying3(toElementCreator(transformation(toUnderlying3(component))))

export const nameFunction =
  (name: string) =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  <F extends Function>(f: F) =>
    // eslint-disable-next-line functional/immutable-data
    Object.defineProperty(f, 'name', { value: name, writable: false })

export const namedConst =
  (name: string) =>
  (component: () => Element): Element =>
    transformUnderlyingComponent1(component)(nameFunction(name))()

export const named =
  (name: string) =>
  <C extends UIComponent1>(component: C): C =>
    transformUnderlyingComponent1(component)(nameFunction(name))

export const named2 =
  (name: string) =>
  <C extends UIComponent2>(component: C): C =>
    transformUnderlyingComponent2(component)(nameFunction(name))

export const named3 =
  (name: string) =>
  <C extends UIComponent3>(component: C): C =>
    transformUnderlyingComponent3(component)(nameFunction(name))

export const memoizedConst =
  (name: string) =>
  (component: () => Element): Element =>
    transformUnderlyingComponent1(component)(
      flow(
        nameFunction(name),
        c => React.memo(c, () => true) as UIUnderlyingComponent1<() => Element>,
      ),
    )()

export const memoized =
  (
    name: string,
  ): {
    <C extends UIComponent1>(component: C): C
    <C extends UIComponent1>(
      propsEquivalence: Equivalence.Equivalence<Arg<C>>,
      component: C,
    ): C
  } =>
  <C extends UIComponent1>(
    ...args:
      | [propsEquivalence: Equivalence.Equivalence<Arg<C>>, component: C]
      | [component: C, arg1?: undefined]
  ): C =>
    transformUnderlyingComponent1(
      args[1] === undefined ? (args[0] as C) : args[1],
    )(
      flow(
        nameFunction(name),
        c =>
          React.memo(
            c,
            Equivalence.tuple(
              args[1] === undefined
                ? Equal.equivalence()
                : (args[0] as Equivalence.Equivalence<Arg<C>>),
            ),
          ) as UIUnderlyingComponent1<C>,
      ),
    )

export const memoized2 =
  (name: string) =>
  <C extends UIComponent2>(
    propsEquivalence: Readonly<
      [
        Equivalence.Equivalence<Arg<C>>,
        Equivalence.Equivalence<Arg<ReturnType<C>>>,
      ]
    >,
    component: C,
  ): C =>
    transformUnderlyingComponent2(component)(
      flow(
        nameFunction(name),
        c =>
          React.memo(
            c,
            Equivalence.tuple(...propsEquivalence),
          ) as UIUnderlyingComponent2<C>,
      ),
    )

export const memoized3 =
  (name: string) =>
  <C extends UIComponent3>(
    propsEquivalence: Readonly<
      [
        Equivalence.Equivalence<Arg<C>>,
        Equivalence.Equivalence<Arg<ReturnType<C>>>,
        Equivalence.Equivalence<Arg<ReturnType<ReturnType<C>>>>,
      ]
    >,
    component: C,
  ): C =>
    transformUnderlyingComponent3(component)(
      flow(
        nameFunction(name),
        c =>
          React.memo(
            c,
            Equivalence.tuple(...propsEquivalence),
          ) as UIUnderlyingComponent3<C>,
      ),
    )
