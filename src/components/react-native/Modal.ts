import { Runtime, identity } from 'effect'
import * as React from 'react'
import { Modal as RNModal_ } from 'react-native'
import { gestureHandlerRootHOC } from 'react-native-gesture-handler'
import { Children, JSXElementsChildren, UIElement } from 'src/components/types'
import { useRuntime } from 'src/contexts/Runtime'
import { AppEvent } from 'src/runtime'
import { isArray } from 'src/utils/fp/Array'
import { named2 } from '../hyperscript'

export type ModalStyleProps = { flex?: number }

export type ModalProps = ModalStyleProps & {
  transparent?: boolean
  visible?: boolean
  animationType?: 'fade'
  statusBarTranslucent?: boolean
  onRequestClose?: AppEvent
}

const GestureHandlerInModal = gestureHandlerRootHOC(
  (props: { children: JSXElementsChildren; key: string }) =>
    React.createElement(React.Fragment, null, props.children),
)

export const NativeModal = named2('NativeModal')((props: ModalProps = {}) =>
  // eslint-disable-next-line react/display-name
  (children: Children): UIElement => {
    const runtime = useRuntime()
    return React.createElement(
      RNModal_,
      identity<React.ComponentProps<typeof RNModal_>>({
        children: React.createElement(
          GestureHandlerInModal,
          null,
          ...(isArray(children) ? children : [children]),
        ),
        transparent: props.transparent,
        visible: props.visible,
        animationType: props.animationType,
        statusBarTranslucent: props.statusBarTranslucent,
        onRequestClose:
          props.onRequestClose &&
          (() =>
            void (
              props.onRequestClose &&
              Runtime.runPromise(runtime)(props.onRequestClose)
            )),
        style: {
          flex: props?.flex,
        },
      }),
      ...children,
    )
  },
)
