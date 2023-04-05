import React from 'react'
import { Modal as Modal_ } from 'react-native'
import { gestureHandlerRootHOC } from 'react-native-gesture-handler'
import { Event, EventHandlerEnv } from 'src/actions'
import { A } from 'src/utils/fp'
import { JSXElementsChildren } from '../types'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type ModalStyleProps<R> = { flex?: number }

export type ModalProps<
  R,
  E1 extends Event<string, unknown> = Event<never, never>,
> = ModalStyleProps<R> & {
  transparent?: boolean
  visible?: boolean
  animationType?: 'fade'
  statusBarTranslucent?: boolean
  onRequestClose?: E1
}

export type ModalArgs<R, E1 extends Event<string, unknown>> = {
  x: ModalProps<R, E1>
  children?: JSXElementsChildren
  env: R & EventHandlerEnv<E1>
}

const GestureHandlerInModal = gestureHandlerRootHOC(
  (props: { children: JSXElementsChildren; key: string }) => (
    <>{props.children}</>
  ),
)

const getRawProps = <R, E1 extends Event<string, unknown>>({
  x: props,
  children,
  env,
}: ModalArgs<R, E1>): React.ComponentProps<typeof Modal_> => ({
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
    props.onRequestClose && env.eventHandler(props.onRequestClose),
  style: {
    flex: props?.flex,
  },
})

export const Modal = <R, E1 extends Event<string, unknown>>(
  args: ModalArgs<R, E1>,
) => <Modal_ {...getRawProps(args)} />
