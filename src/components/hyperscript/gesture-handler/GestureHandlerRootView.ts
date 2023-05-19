import { $, A, apply } from 'fp'
import { Reader } from 'fp-ts/lib/Reader'
import React from 'react'
import { GestureHandlerRootView as GestureHandlerRootView_ } from 'react-native-gesture-handler'
import { Element } from 'src/components/custom/types'

export const GestureHandlerRootView =
  <R>(children: ReadonlyArray<Reader<R, Element>>) =>
  // eslint-disable-next-line react/display-name
  (env: R) =>
    React.createElement(
      GestureHandlerRootView_,
      { style: { flex: 1 } },
      ...$(children, A.map(apply(env))),
    )
