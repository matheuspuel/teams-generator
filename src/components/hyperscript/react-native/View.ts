import { $, R, RA, apply } from 'fp'
import React from 'react'
import { Event, EventHandlerEnv } from 'src/actions'
import { View as View_ } from 'src/components/custom'
import { ViewProps } from 'src/components/custom/react-native/View'
import { Element } from 'src/components/custom/types'

export const View =
  <R1, E1 extends Event<string, unknown> = Event<never, never>>(
    props: ViewProps<R1, E1> = {},
  ) =>
  <
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    C extends ReadonlyArray<(env: any) => Element>,
  >(
    children: C,
  ) =>
  // eslint-disable-next-line react/display-name
  (env: R1 & EventHandlerEnv<E1> & R.EnvType<C[number]>): Element =>
    React.createElement(
      View_<R1 & R.EnvType<C[number]>, E1>,
      { x: props, env },
      ...$(children, RA.map(apply(env))),
    )
