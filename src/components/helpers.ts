import { $f, A, Endomorphism, Eq, Rec } from 'fp'
import React from 'react'
import { shallowEqual } from 'react-redux'

type Element = React.ReactElement

export type UIComponent1<Args extends [unknown]> = (a0: Args[0]) => Element

export type UIComponent2<Args extends [unknown, unknown]> = (
  a0: Args[0],
) => (a1: Args[1]) => Element

type UIUnderlyingComponent<Args extends [...Array<unknown>]> = (
  args: UIBundledProps<Args>,
) => Element

export type UIBundledProps<Args extends [...Array<unknown>]> = Args

const toUnderlying1 =
  <A1>(component: UIComponent1<[A1]>): UIUnderlyingComponent<[A1]> =>
  args =>
    component(args[0])

const toUnderlying2 =
  <A1, A2>(
    component: UIComponent2<[A1, A2]>,
  ): UIUnderlyingComponent<[A1, A2]> =>
  args =>
    component(args[0])(args[1])

const fromUnderlying1 =
  <A1>(component: UIUnderlyingComponent<[A1]>): UIComponent1<[A1]> =>
  a1 =>
    component([a1])

const fromUnderlying2 =
  <A1, A2>(
    component: UIUnderlyingComponent<[A1, A2]>,
  ): UIComponent2<[A1, A2]> =>
  a1 =>
  a2 =>
    component([a1, a2])

export const toElementCreator =
  <Args extends [...Array<unknown>]>(
    component: UIUnderlyingComponent<Args>,
  ): UIUnderlyingComponent<Args> =>
  // eslint-disable-next-line react/display-name
  args =>
    React.createElement(component, args)

export const transformUnderlyingComponent1 =
  <A1>(component: UIComponent1<[A1]>) =>
  (
    transformation: Endomorphism<UIUnderlyingComponent<[A1]>>,
  ): UIComponent1<[A1]> =>
    fromUnderlying1(toElementCreator(transformation(toUnderlying1(component))))

export const transformUnderlyingComponent2 =
  <A1, A2>(component: UIComponent2<[A1, A2]>) =>
  (
    transformation: Endomorphism<UIUnderlyingComponent<[A1, A2]>>,
  ): UIComponent2<[A1, A2]> =>
    fromUnderlying2(toElementCreator(transformation(toUnderlying2(component))))

export const nameFunction =
  (name: string) =>
  // eslint-disable-next-line @typescript-eslint/ban-types
  <F extends Function>(f: F) =>
    // eslint-disable-next-line functional/immutable-data
    Object.defineProperty(f, 'name', { value: name, writable: false })

export const named2 =
  (name: string) =>
  <A1, A2>(component: UIComponent2<[A1, A2]>): UIComponent2<[A1, A2]> =>
    transformUnderlyingComponent2(component)(nameFunction(name))

export const memoized1 =
  (name: string) =>
  <A1>(
    propsAreEqual: Eq.Eq<Readonly<UIBundledProps<[A1]>>>,
    component: UIComponent1<[A1]>,
  ): UIComponent1<[A1]> =>
    transformUnderlyingComponent1(component)(
      $f(
        nameFunction(name),
        c => React.memo(c, propsAreEqual.equals) as UIUnderlyingComponent<[A1]>,
      ),
    )

export const memoized2 =
  (name: string) =>
  <A1, A2>(
    propsAreEqual: Eq.Eq<Readonly<UIBundledProps<[A1, A2]>>>,
    component: UIComponent2<[A1, A2]>,
  ): UIComponent2<[A1, A2]> =>
    transformUnderlyingComponent2(component)(
      $f(
        nameFunction(name),
        c =>
          React.memo(c, propsAreEqual.equals) as UIUnderlyingComponent<
            [A1, A2]
          >,
      ),
    )

export const memoizedConst =
  (name: string) =>
  <A1>(component: UIComponent1<[A1]>): UIComponent1<[A1]> =>
    transformUnderlyingComponent1(component)(
      $f(
        nameFunction(name),
        c =>
          React.memo(c, Eq.tuple(Eq.eqStrict).equals) as UIUnderlyingComponent<
            [A1]
          >,
      ),
    )

export const memoized =
  (name: string) =>
  <A1, A2>(
    propsEq: Eq.Eq<Readonly<A1>>,
    component: UIComponent2<[A1, A2]>,
  ): UIComponent2<[A1, A2]> =>
    transformUnderlyingComponent2(component)(
      $f(
        nameFunction(name),
        c =>
          React.memo(
            c,
            Eq.tuple(propsEq, Eq.eqStrict).equals,
          ) as UIUnderlyingComponent<[A1, A2]>,
      ),
    )

export const shallowEq = Eq.fromEquals<unknown>(shallowEqual)

export const deepEq: Eq.Eq<unknown> = Eq.fromEquals((a, b) =>
  a === b
    ? true
    : Array.isArray(a)
    ? Array.isArray(b) && A.getEq(deepEq).equals(a, b)
    : typeof a === 'object' &&
      typeof b === 'object' &&
      a !== null &&
      b !== null &&
      Rec.getEq(deepEq).equals(
        a as Record<string, unknown>,
        b as Record<string, unknown>,
      ),
)
