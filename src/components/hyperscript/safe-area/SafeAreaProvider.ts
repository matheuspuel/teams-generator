import { Reader } from 'fp-ts/lib/Reader'
import React from 'react'
import {
  SafeAreaProvider as SafeAreaProvider_,
  SafeAreaProviderProps,
} from 'src/components/custom2/safe-area/SafeAreaProvider'
import { Element } from 'src/components/custom2/types'
import { $, apply, RA } from 'src/utils/fp'

export const SafeAreaProvider =
  <R1>(props: SafeAreaProviderProps<R1> = {}) =>
  <R2>(children: ReadonlyArray<Reader<R2, Element>>) =>
  (env: R1 & R2) =>
    React.createElement(
      SafeAreaProvider_<R1 & R2>,
      { x: props, env },
      ...$(children, RA.map(apply(env))),
    )
