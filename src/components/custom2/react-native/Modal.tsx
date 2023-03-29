import { ReaderIO } from 'fp-ts/lib/ReaderIO'
import React from 'react'
import { Modal as Modal_ } from 'react-native'
import { gestureHandlerRootHOC } from 'react-native-gesture-handler'
import { JSXElementsChildren } from '../types'

export type ModalStyleProps<R> = { flex?: number }

export type ModalProps<R> = ModalStyleProps<R> & {
  transparent?: boolean
  visible?: boolean
  animationType?: 'fade'
  statusBarTranslucent?: boolean
  onRequestClose?: ReaderIO<R, void>
}

export type ModalArgs<R> = {
  x: ModalProps<R>
  children?: JSXElementsChildren
  env: R
}

const GestureHandlerInModal = gestureHandlerRootHOC(
  (props: { children: JSXElementsChildren; key: string }) => (
    <>{props.children}</>
  ),
)

const getRawProps = <R extends unknown>({
  x: props,
  children,
  env,
}: ModalArgs<R>): React.ComponentProps<typeof Modal_> => ({
  children: React.createElement(
    GestureHandlerInModal,
    null,
    ...(Array.isArray(children) ? children : [children]),
  ),
  transparent: props.transparent,
  visible: props.visible,
  animationType: props.animationType,
  statusBarTranslucent: props.statusBarTranslucent,
  onRequestClose: props.onRequestClose?.(env),
  style: {
    flex: props?.flex,
  },
})

export const Modal = <R extends unknown>(args: ModalArgs<R>) => (
  <Modal_ {...getRawProps(args)} />
)
