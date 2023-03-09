import { $, apply, RA } from 'fp'
import React from 'react'

export const Fragment =
  <R>(children: ReadonlyArray<(env: R) => React.ReactElement>) =>
  // eslint-disable-next-line react/display-name
  (env: R) =>
    React.createElement(
      React.Fragment,
      null,
      ...$(children, RA.map(apply(env))),
    )
