import { A, Runtime, apply, pipe } from 'fp'
import React from 'react'
import { Screen as RNSScreen_ } from 'react-native-screens'
import { Children, JSXElementsChildren, UIElement } from 'src/components/types'
import { Colors } from 'src/services/Theme'
import { UIEnv } from 'src/services/UI'
import { Color } from 'src/utils/datatypes'

export type ScreenProps = object

export type ScreenArgs = {
  x: ScreenProps
  children?: JSXElementsChildren
  env: UIEnv
}

const getRawProps = ({
  x: _props,
  children,
  env,
}: ScreenArgs): React.ComponentProps<typeof RNSScreen_> & {
  key?: string
} => ({
  children: children,
  stackAnimation: 'none',
  style: {
    backgroundColor: Color.toHex(
      Runtime.runSync(env.runtime)(Colors.background),
    ),
  },
})

const Screen_ = (args: ScreenArgs) =>
  React.createElement(RNSScreen_, getRawProps(args))

export const Screen =
  (props: ScreenProps = {}) =>
  (children: Children): UIElement =>
  // eslint-disable-next-line react/display-name
  env =>
    React.createElement(
      Screen_,
      { x: props, env },
      ...pipe(children, A.map(apply(env))),
    )
