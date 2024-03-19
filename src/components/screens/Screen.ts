import * as React from 'react'
import { Screen as RNSScreen_ } from 'react-native-screens'
import {
  Children,
  JSXElementsChildren,
  UIColor,
  UIElement,
} from 'src/components/types'
import { useThemeGetRawColor } from 'src/contexts/Theme'
import { Colors } from 'src/services/Theme'
import { named2 } from '../hyperscript'

export type ScreenProps = object

export type ScreenArgs = {
  x: ScreenProps
  children?: JSXElementsChildren
  getRawColor: (color: UIColor) => string
}

const getRawProps = ({
  x: _props,
  children,
  getRawColor,
}: ScreenArgs): React.ComponentProps<typeof RNSScreen_> & {
  key?: string
} => ({
  children: children,
  stackAnimation: 'none',
  style: {
    backgroundColor: getRawColor(Colors.background),
  },
})

const Screen_ = (args: ScreenArgs) =>
  React.createElement(RNSScreen_, getRawProps(args))

export const Screen = named2('Screen')((props: ScreenProps = {}) =>
  // eslint-disable-next-line react/display-name
  (children: Children): UIElement => {
    const getRawColor = useThemeGetRawColor()
    return React.createElement(Screen_, { x: props, getRawColor }, ...children)
  },
)
