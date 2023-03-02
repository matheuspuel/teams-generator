import React from 'react'

export const Fragment = (children: Array<React.ReactNode>) =>
  React.createElement(React.Fragment, null, ...children)
