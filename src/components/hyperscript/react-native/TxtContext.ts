import { Reader } from 'fp-ts/lib/Reader'
import React from 'react'
import { TxtContext as TxtContext_ } from 'src/components/custom'
import { TextProps } from 'src/components/custom/react-native/Txt'
import { Element } from 'src/components/custom/types'
import { $, RA, apply } from 'src/utils/fp'

export const TxtContext =
  <R1>(props: TextProps<R1> = {}) =>
  <R2>(children: ReadonlyArray<Reader<R2, Element>>) =>
  (env: R1 & R2) =>
    React.createElement(
      TxtContext_<R1 & R2>,
      { x: props, env },
      ...$(children, RA.map(apply(env))),
    )
