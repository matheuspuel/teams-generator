import { Runtime } from 'fp'
import React from 'react'
import { Screen as RNSScreen_ } from 'react-native-screens'
import { Children, JSXElementsChildren, UIElement } from 'src/components/types'
import { useRuntime } from 'src/contexts/Runtime'
import { AppRuntime } from 'src/runtime'
import { Colors } from 'src/services/Theme'
import { Color } from 'src/utils/datatypes'
import { named2 } from '../hyperscript'

export type ScreenProps = object

export type ScreenArgs = {
  x: ScreenProps
  children?: JSXElementsChildren
  runtime: AppRuntime
}

const getRawProps = ({
  x: _props,
  children,
  runtime,
}: ScreenArgs): React.ComponentProps<typeof RNSScreen_> & {
  key?: string
} => ({
  children: children,
  stackAnimation: 'none',
  style: {
    backgroundColor: Color.toHex(Runtime.runSync(runtime)(Colors.background)),
  },
})

const Screen_ = (args: ScreenArgs) =>
  React.createElement(RNSScreen_, getRawProps(args))

export const Screen = named2('Screen')((props: ScreenProps = {}) =>
  // eslint-disable-next-line react/display-name
  (children: Children): UIElement => {
    const runtime = useRuntime()
    return React.createElement(Screen_, { x: props, runtime }, ...children)
  },
)
