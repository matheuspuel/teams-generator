import React from 'react'

export const Fragment = (children: ReadonlyArray<React.ReactElement>) =>
  React.createElement(React.Fragment, null, ...children)
