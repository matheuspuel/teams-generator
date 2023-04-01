import { $, apply, RA } from 'fp'
import { Reader } from 'fp-ts/lib/Reader'
import React from 'react'
import {
  SafeAreaProvider as SafeAreaProvider_,
  SafeAreaProviderProps,
} from 'src/components/custom/safe-area/SafeAreaProvider'
import { Element } from 'src/components/custom/types'

export const SafeAreaProvider =
  <R1>(props: SafeAreaProviderProps<R1> = {}) =>
  <R2>(children: ReadonlyArray<Reader<R2, Element>>) =>
  (env: R1 & R2) =>
    React.createElement(
      SafeAreaProvider_<R1 & R2>,
      { x: props, env },
      ...$(children, RA.map(apply(env))),
    )
