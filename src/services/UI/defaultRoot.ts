import { R } from 'fp'
import React from 'react'
import { UIRoot } from 'src/views'

export const DefaultUIRoot = (props: R.EnvType<typeof UIRoot>) =>
  React.createElement(UIRoot, props)
