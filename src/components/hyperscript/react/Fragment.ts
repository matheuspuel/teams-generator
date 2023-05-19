import { $, A, R, apply } from 'fp'
import React from 'react'
import { Element } from 'src/components/custom/types'

export const Fragment =
  <
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    C extends ReadonlyArray<(env: any) => Element>,
  >(
    children: C,
  ) =>
  // eslint-disable-next-line react/display-name
  (env: R.EnvType<C[number]>): Element =>
    React.createElement(React.Fragment, null, ...$(children, A.map(apply(env))))
