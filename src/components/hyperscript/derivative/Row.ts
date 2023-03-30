import { Reader } from 'fp-ts/lib/Reader'
import React from 'react'
import { Row as Row_ } from 'src/components/custom2'
import { ViewProps } from 'src/components/custom2/react-native/View'
import { Element } from 'src/components/custom2/types'
import { $, RA, apply } from 'src/utils/fp'

export const Row =
  <R1>(props: ViewProps<R1> = {}) =>
  <R2>(children: ReadonlyArray<Reader<R2, Element>>) =>
  (env: R1 & R2) =>
    React.createElement(
      Row_<R1 & R2>,
      { x: props, env },
      ...$(children, RA.map(apply(env))),
    )
