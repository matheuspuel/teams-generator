import { $, A, R, apply } from 'fp'
import React from 'react'
import { Event, EventHandlerEnv } from 'src/actions'
import { Row as Row_ } from 'src/components/custom'
import { ViewProps } from 'src/components/custom/react-native/View'
import { Element } from 'src/components/custom/types'

export const Row =
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
  (env: R1 & R.EnvType<C[number]> & EventHandlerEnv<E1>): Element =>
    React.createElement(
      Row_<R1 & R.EnvType<C[number]>, E1>,
      { x: props, env },
      ...$(children, A.map(apply(env))),
    )
