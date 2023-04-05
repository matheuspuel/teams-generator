import { $, R, RA, apply } from 'fp'
import React from 'react'
import { Event, EventHandlerEnv } from 'src/actions'
import { Pressable as Pressable_ } from 'src/components/custom'
import { PressableProps } from 'src/components/custom/animated/Pressable'
import { Element } from 'src/components/custom/types'

export const Pressable =
  <R1, E1 extends Event<string, unknown>>(props: PressableProps<R1, E1>) =>
  <
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    C extends ReadonlyArray<(env: any) => Element>,
  >(
    children: C,
  ) =>
  // eslint-disable-next-line react/display-name
  (env: R1 & EventHandlerEnv<E1> & R.EnvType<C[number]>): Element =>
    React.createElement(
      Pressable_<R1 & R.EnvType<C[number]>, E1>,
      { x: props, env },
      ...$(children, RA.map(apply(env))),
    )
