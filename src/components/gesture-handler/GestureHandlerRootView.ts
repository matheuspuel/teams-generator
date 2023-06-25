import { $, A, apply } from 'fp'
import React from 'react'
import { GestureHandlerRootView as GestureHandlerRootView_ } from 'react-native-gesture-handler'
import { Children, UIElement } from 'src/components/types'

export const GestureHandlerRootView =
  (children: Children): UIElement =>
  // eslint-disable-next-line react/display-name
  env =>
    React.createElement(
      GestureHandlerRootView_,
      { style: { flex: 1 } },
      ...$(children, A.map(apply(env))),
    )
