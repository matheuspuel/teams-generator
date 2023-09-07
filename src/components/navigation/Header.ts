import RawHeader_ from '@react-navigation/elements/src/Header/Header'
import { $, Runtime, constant } from 'fp'
import React from 'react'
import { Element, UIColor, UIElement } from 'src/components/types'
import { UIEnv } from 'src/services/UI'
import { Color } from 'src/utils/datatypes'

export type HeaderProps = {
  title: string
  headerStyle?: { backgroundColor?: UIColor }
  headerTitleStyle?: { color?: UIColor }
  headerLeft?: UIElement
  headerRight?: UIElement
}

export type HeaderArgs = {
  x: HeaderProps
  env: UIEnv
}

const getRawProps = ({
  x: props,
  env,
}: HeaderArgs): React.ComponentProps<typeof RawHeader_> => ({
  title: props.title,
  headerStyle: props.headerStyle
    ? {
        backgroundColor: $(props.headerStyle.backgroundColor, c =>
          c ? Color.toHex(Runtime.runSync(env.runtime)(c)) : undefined,
        ),
      }
    : undefined,
  headerTitleStyle: props.headerTitleStyle
    ? {
        color: $(props.headerTitleStyle.color, c =>
          c ? Color.toHex(Runtime.runSync(env.runtime)(c)) : undefined,
        ),
      }
    : undefined,
  headerLeft: props.headerLeft ? constant(props.headerLeft(env)) : undefined,
  headerRight: props.headerRight ? constant(props.headerRight(env)) : undefined,
})

const Header_ = (args: HeaderArgs) =>
  React.createElement(RawHeader_, getRawProps(args))

export const Header =
  (props: HeaderProps): UIElement =>
  // eslint-disable-next-line react/display-name
  (env): Element =>
    React.createElement(Header_, { x: props, env })
