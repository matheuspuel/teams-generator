import { A, apply, pipe } from 'fp'
import React from 'react'
import { Children, UIElement } from 'src/components/types'

export const Fragment =
  (children: Children): UIElement =>
  // eslint-disable-next-line react/display-name
  env =>
    React.createElement(
      React.Fragment,
      null,
      ...pipe(children, A.map(apply(env))),
    )
