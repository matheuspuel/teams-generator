import { ReaderIO } from 'fp-ts/lib/ReaderIO'
import React from 'react'
import { Modal as Modal_ } from 'src/components/hyperscript/reactNative'

export const Modal =
  <R1>(props: {
    transparent?: boolean
    visible?: boolean
    style?: { flex?: number }
    animationType?: 'fade'
    statusBarTranslucent?: boolean
    onRequestClose?: ReaderIO<R1, void>
  }) =>
  <R2>(children: ReadonlyArray<(env: R2) => React.ReactElement>) =>
  (env: R1 & R2) =>
    Modal_({ ...props, onRequestClose: props.onRequestClose?.(env) })(children)(
      env,
    )
