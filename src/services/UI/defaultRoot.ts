import React from 'react'
import { UIRoot } from 'src/views'
import { UIEnv } from '.'

export const DefaultUIRoot = (props: UIEnv) =>
  React.createElement(UIRoot, props)
