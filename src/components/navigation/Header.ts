import RawHeader_ from '@react-navigation/elements/src/Header/Header'
import { pipe } from 'effect'
import { constant } from 'effect/Function'
import React from 'react'
import { UIColor, UIElement } from 'src/components/types'
import { TextStyleContext, useTextStyle } from 'src/contexts/TextStyle'
import { useThemeGetRawColor } from 'src/contexts/Theme'
import { named } from '../hyperscript'

export type HeaderProps = {
  title: string
  headerStyle?: { backgroundColor?: UIColor }
  headerTitleStyle?: { color?: UIColor }
  headerLeft?: UIElement
  headerRight?: UIElement
}

export type HeaderArgs = {
  x: HeaderProps
  getRawColor: (color: UIColor) => string
  textStyle: TextStyleContext
}

const getRawProps = ({
  x: props,
  getRawColor,
  textStyle,
}: HeaderArgs): React.ComponentProps<typeof RawHeader_> => ({
  title: props.title,
  headerStyle: props.headerStyle
    ? {
        backgroundColor: pipe(props.headerStyle.backgroundColor, c =>
          c ? getRawColor(c) : undefined,
        ),
      }
    : undefined,
  headerTitleStyle: {
    color: pipe(props.headerTitleStyle?.color ?? textStyle.color, getRawColor),
  },
  headerLeft: props.headerLeft ? constant(props.headerLeft) : undefined,
  headerRight: props.headerRight ? constant(props.headerRight) : undefined,
  headerShadowVisible: false,
})

const Header_ = (args: HeaderArgs) =>
  React.createElement(RawHeader_, getRawProps(args))

export const HeaderComponent = named('HeaderComponent')((
  props: HeaderProps,
): UIElement => {
  const getRawColor = useThemeGetRawColor()
  const textStyle = useTextStyle()
  return React.createElement(Header_, { x: props, getRawColor, textStyle })
})
