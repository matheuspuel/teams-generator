import { Reader } from 'fp-ts/lib/Reader'
import React from 'react'
import { Pressable as Pressable_ } from 'src/components/custom'
import { PressableProps } from 'src/components/custom/animated/Pressable'
import { Element } from 'src/components/custom/types'
import { $, RA, apply } from 'src/utils/fp'

export const Pressable =
  <P extends PressableProps<any>>(props: P) =>
  <R2>(children: ReadonlyArray<Reader<R2, Element>>) =>
  (env: (P extends PressableProps<infer R1> ? R1 : never) & R2) =>
    React.createElement(
      Pressable_<(P extends PressableProps<infer R1> ? R1 : never) & R2>,
      { x: props, env },
      ...$(children, RA.map(apply(env))),
    )
