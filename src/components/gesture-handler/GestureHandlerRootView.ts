import React from 'react'
import { GestureHandlerRootView as GestureHandlerRootView_ } from 'react-native-gesture-handler'
import { Children, UIElement } from 'src/components/types'
import { named } from '../helpers'

export const GestureHandlerRootView = named('GestureHandlerRootView')(
  (children: Children): UIElement =>
    React.createElement(
      GestureHandlerRootView_,
      { style: { flex: 1 } },
      ...children,
    ),
)
