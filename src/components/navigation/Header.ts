import RawHeader_ from '@react-navigation/elements/src/Header/Header'
import { Runtime, constant, pipe } from 'fp'
import React from 'react'
import { UIColor, UIElement } from 'src/components/types'
import { useRuntime } from 'src/contexts/Runtime'
import { AppRuntime } from 'src/runtime'
import { Color } from 'src/utils/datatypes'
import { named } from '../helpers'

export type HeaderProps = {
  title: string
  headerStyle?: { backgroundColor?: UIColor }
  headerTitleStyle?: { color?: UIColor }
  headerLeft?: UIElement
  headerRight?: UIElement
}

export type HeaderArgs = {
  x: HeaderProps
  runtime: AppRuntime
}

const getRawProps = ({
  x: props,
  runtime,
}: HeaderArgs): React.ComponentProps<typeof RawHeader_> => ({
  title: props.title,
  headerStyle: props.headerStyle
    ? {
        backgroundColor: pipe(props.headerStyle.backgroundColor, c =>
          c ? Color.toHex(Runtime.runSync(runtime)(c)) : undefined,
        ),
      }
    : undefined,
  headerTitleStyle: props.headerTitleStyle
    ? {
        color: pipe(props.headerTitleStyle.color, c =>
          c ? Color.toHex(Runtime.runSync(runtime)(c)) : undefined,
        ),
      }
    : undefined,
  headerLeft: props.headerLeft ? constant(props.headerLeft) : undefined,
  headerRight: props.headerRight ? constant(props.headerRight) : undefined,
})

const Header_ = (args: HeaderArgs) =>
  React.createElement(RawHeader_, getRawProps(args))

export const Header = named('Header')((props: HeaderProps): UIElement => {
  const runtime = useRuntime()
  return React.createElement(Header_, { x: props, runtime })
})
