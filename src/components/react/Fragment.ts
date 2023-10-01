import React from 'react'
import { Children, UIElement } from 'src/components/types'

export const Fragment = (children: Children): UIElement =>
  React.createElement(React.Fragment, null, ...children)
