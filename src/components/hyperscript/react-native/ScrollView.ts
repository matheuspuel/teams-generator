import { $, RA, Reader, apply } from 'fp'
import React from 'react'
import { ScrollView as ScrollView_ } from 'src/components/custom2'
import { ScrollViewProps } from 'src/components/custom2/react-native/ScrollView'
import { Element } from 'src/components/custom2/types'

export const ScrollView =
  <R1>(props: ScrollViewProps<R1> = {}) =>
  <R2>(children: ReadonlyArray<Reader<R2, Element>>) =>
  (env: R1 & R2) =>
    React.createElement(
      ScrollView_<R1 & R2>,
      { x: props, env },
      ...$(children, RA.map(apply(env))),
    )
