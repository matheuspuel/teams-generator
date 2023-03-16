import React from 'react'
import { ActivityIndicator as ActivityIndicator_ } from 'src/components/custom/basic/ActivityIndicator'
import { makeComponentWithoutChildren } from 'src/components/hyperscript/helpers'

export const ActivityIndicator = (
  props?: React.ComponentProps<typeof ActivityIndicator_>['x'],
) => makeComponentWithoutChildren(ActivityIndicator_)({ x: props })
