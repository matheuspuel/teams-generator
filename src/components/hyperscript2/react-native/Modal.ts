import { Reader } from 'fp-ts/lib/Reader'
import React from 'react'
import { Modal as Modal_ } from 'src/components/custom2'
import { ModalProps } from 'src/components/custom2/react-native/Modal'
import { Element } from 'src/components/custom2/types'
import { $, RA, apply } from 'src/utils/fp'

export const Modal =
  <R1>(props: ModalProps<R1> = {}) =>
  <R2>(children: ReadonlyArray<Reader<R2, Element>>) =>
  (env: R1 & R2) =>
    React.createElement(
      Modal_<R1 & R2>,
      { x: props, env },
      ...$(children, RA.map(apply(env))),
    )
