import { $, A, Reader, apply } from 'fp'
import React from 'react'
import { ScrollView as ScrollView_ } from 'src/components/custom'
import { ScrollViewProps } from 'src/components/custom/react-native/ScrollView'
import { Element } from 'src/components/custom/types'

export const ScrollView =
  <R1>(props: ScrollViewProps<R1> = {}) =>
  <R2>(children: ReadonlyArray<Reader<R2, Element>>) =>
  // eslint-disable-next-line react/display-name
  (env: R1 & R2) =>
    React.createElement(
      ScrollView_<R1 & R2>,
      { x: props, env },
      ...$(children, A.map(apply(env))),
    )
