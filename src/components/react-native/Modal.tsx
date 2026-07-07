import * as React from 'react'
import { Modal as RNModal_ } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

export type ModalStyleProps = { flex?: number }

export type ModalProps = ModalStyleProps & {
  transparent?: boolean
  visible?: boolean
  animationType?: 'fade'
  statusBarTranslucent?: boolean
  onRequestClose?: () => void
  children: React.ReactNode
}

export const NativeModal = (props: ModalProps) => {
  return (
    <RNModal_
      transparent={props.transparent}
      visible={props.visible}
      animationType={props.animationType}
      statusBarTranslucent={props.statusBarTranslucent}
      onRequestClose={props.onRequestClose}
      style={{ flex: props?.flex }}
    >
      <GestureHandlerRootView>{props.children}</GestureHandlerRootView>
    </RNModal_>
  )
}
