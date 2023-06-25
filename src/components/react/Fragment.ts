import { $, A, apply } from 'fp'
import React from 'react'
import { Children, UIElement } from 'src/components/types'

export const Fragment =
  (children: Children): UIElement =>
  // eslint-disable-next-line react/display-name
  env =>
    React.createElement(React.Fragment, null, ...$(children, A.map(apply(env))))
