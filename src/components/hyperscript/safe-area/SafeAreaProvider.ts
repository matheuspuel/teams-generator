import { $, A, apply } from 'fp'
import { Reader } from 'fp-ts/lib/Reader'
import React from 'react'
import {
  SafeAreaProviderArgs,
  SafeAreaProviderProps,
  SafeAreaProvider as SafeAreaProvider_,
} from 'src/components/custom/safe-area/SafeAreaProvider'
import { Element } from 'src/components/custom/types'

export const SafeAreaProvider =
  <R1>(props: SafeAreaProviderProps<R1> = {}) =>
  <R2>(children: ReadonlyArray<Reader<R2, Element>>) =>
  // eslint-disable-next-line react/display-name
  (env: SafeAreaProviderArgs<R1 & R2>['env']) =>
    React.createElement(
      SafeAreaProvider_<R1 & R2>,
      { x: props, env },
      ...$(children, A.map(apply(env))),
    )
