import { Reader } from 'fp-ts/lib/Reader'
import React from 'react'
import { View as View_ } from 'src/components/custom'
import { ViewProps } from 'src/components/custom/react-native/View'
import { Element } from 'src/components/custom/types'
import { $, RA, apply } from 'src/utils/fp'

export const View =
  <R1>(props: ViewProps<R1> = {}) =>
  <R2>(children: ReadonlyArray<Reader<R2, Element>>) =>
  (env: R1 & R2) =>
    React.createElement(
      View_<R1 & R2>,
      { x: props, env },
      ...$(children, RA.map(apply(env))),
    )
