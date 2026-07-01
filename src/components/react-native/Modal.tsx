import { Runtime } from 'effect'
import * as React from 'react'
import { Modal as RNModal_ } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useRuntime } from 'src/contexts/Runtime'
import { AppEvent } from 'src/runtime'

export type ModalStyleProps = { flex?: number }

export type ModalProps = ModalStyleProps & {
  transparent?: boolean
  visible?: boolean
  animationType?: 'fade'
  statusBarTranslucent?: boolean
  onRequestClose?: AppEvent
  children: React.ReactNode
}

export const NativeModal = (props: ModalProps) => {
  const runtime = useRuntime()
  return (
    <RNModal_
      transparent={props.transparent}
      visible={props.visible}
      animationType={props.animationType}
      statusBarTranslucent={props.statusBarTranslucent}
      onRequestClose={
        props.onRequestClose &&
        (() =>
          void (
            props.onRequestClose &&
            Runtime.runPromise(runtime)(props.onRequestClose)
          ))
      }
      style={{ flex: props?.flex }}
    >
      <GestureHandlerRootView>{props.children}</GestureHandlerRootView>
    </RNModal_>
  )
}
