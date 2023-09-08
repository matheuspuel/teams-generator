import { $, A, Runtime, apply } from 'fp'
import React from 'react'
import { Modal as RNModal_ } from 'react-native'
import { gestureHandlerRootHOC } from 'react-native-gesture-handler'
import { Children, JSXElementsChildren, UIElement } from 'src/components/types'
import { AppEvent } from 'src/events'
import { UIEnv } from 'src/services/UI'

export type ModalStyleProps = { flex?: number }

export type ModalProps = ModalStyleProps & {
  transparent?: boolean
  visible?: boolean
  animationType?: 'fade'
  statusBarTranslucent?: boolean
  onRequestClose?: AppEvent
}

export type ModalArgs = {
  x: ModalProps
  children?: JSXElementsChildren
  env: UIEnv
}

const GestureHandlerInModal = gestureHandlerRootHOC(
  (props: { children: JSXElementsChildren; key: string }) =>
    React.createElement(React.Fragment, null, props.children),
)

const getRawProps = ({
  x: props,
  children,
  env,
}: ModalArgs): React.ComponentProps<typeof RNModal_> => ({
  children: React.createElement(
    GestureHandlerInModal,
    null,
    ...(A.isArray(children) ? children : [children]),
  ),
  transparent: props.transparent,
  visible: props.visible,
  animationType: props.animationType,
  statusBarTranslucent: props.statusBarTranslucent,
  onRequestClose:
    props.onRequestClose &&
    (() =>
      props.onRequestClose &&
      Runtime.runPromise(env.runtime)(props.onRequestClose)),
  style: {
    flex: props?.flex,
  },
})

const Modal_ = (args: ModalArgs) =>
  React.createElement(RNModal_, getRawProps(args))

export const Modal =
  (props: ModalProps = {}) =>
  (children: Children): UIElement =>
  // eslint-disable-next-line react/display-name
  env =>
    React.createElement(
      Modal_,
      { x: props, env },
      ...$(children, A.map(apply(env))),
    )
