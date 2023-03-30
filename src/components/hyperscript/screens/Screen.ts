import { Reader } from 'fp-ts/lib/Reader'
import React from 'react'
import {
  Screen as Screen_,
  ScreenProps,
} from 'src/components/custom/screens/Screen'
import { Element } from 'src/components/custom/types'
import { $, apply, RA } from 'src/utils/fp'

export const Screen =
  <R1>(props: ScreenProps<R1> = {}) =>
  <R2>(children: ReadonlyArray<Reader<R2, Element>>) =>
  (env: R1 & R2) =>
    React.createElement(
      Screen_<R1 & R2>,
      { x: props, env },
      ...$(children, RA.map(apply(env))),
    )
