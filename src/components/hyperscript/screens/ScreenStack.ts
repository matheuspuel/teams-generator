import { $, apply, R, RA } from 'fp'
import React from 'react'
import {
  ScreenStack as ScreenStack_,
  ScreenStackProps,
} from 'src/components/custom/screens/ScreenStack'
import { Element } from 'src/components/custom/types'

export const ScreenStack =
  <R1>(props: ScreenStackProps<R1> = {}) =>
  <
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    C extends ReadonlyArray<(env: any) => Element>,
  >(
    children: C,
  ) =>
  // eslint-disable-next-line react/display-name
  (env: R1 & R.EnvType<C[number]>): Element =>
    React.createElement(
      ScreenStack_<R1 & R.EnvType<C[number]>>,
      { x: props, env },
      ...$(children, RA.map(apply(env))),
    )
