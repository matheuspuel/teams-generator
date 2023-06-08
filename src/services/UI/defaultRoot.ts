import { R } from 'fp'
import React from 'react'
import { UIRoot } from 'src/views'

export type DefaultUIRequirements = R.EnvType<typeof UIRoot>

export const DefaultUIRoot = (props: DefaultUIRequirements) =>
  React.createElement(UIRoot, props)
