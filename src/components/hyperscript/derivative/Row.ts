import { $, RA, apply } from 'fp'
import { Reader } from 'fp-ts/lib/Reader'
import React from 'react'
import { Row as Row_ } from 'src/components/custom'
import { ViewProps } from 'src/components/custom/react-native/View'
import { Element } from 'src/components/custom/types'

export const Row =
  <R1>(props: ViewProps<R1> = {}) =>
  <R2>(children: ReadonlyArray<Reader<R2, Element>>) =>
  (env: R1 & R2) =>
    React.createElement(
      Row_<R1 & R2>,
      { x: props, env },
      ...$(children, RA.map(apply(env))),
    )
