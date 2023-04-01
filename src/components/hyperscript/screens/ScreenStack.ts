import { $, apply, RA } from 'fp'
import { Reader } from 'fp-ts/lib/Reader'
import React from 'react'
import {
  ScreenStack as ScreenStack_,
  ScreenStackProps,
} from 'src/components/custom/screens/ScreenStack'
import { Element } from 'src/components/custom/types'

export const ScreenStack =
  <R1>(props: ScreenStackProps<R1> = {}) =>
  <R2>(children: ReadonlyArray<Reader<R2, Element>>) =>
  (env: R1 & R2) =>
    React.createElement(
      ScreenStack_<R1 & R2>,
      { x: props, env },
      ...$(children, RA.map(apply(env))),
    )
