import { Header as RawHeader_ } from '@react-navigation/elements'
import { pipe } from 'effect'
import { constant } from 'effect/Function'
import * as React from 'react'
import { UIColor } from 'src/components/types'
import { useTextStyle } from 'src/contexts/TextStyle'
import { useThemeGetRawColor } from 'src/contexts/Theme'

export type HeaderProps = {
  title: string
  headerStyle?: { backgroundColor?: UIColor }
  headerTitleStyle?: { color?: UIColor }
  headerLeft?: React.ReactNode
  headerRight?: React.ReactNode
}

export const HeaderComponent = (props: HeaderProps) => {
  const getRawColor = useThemeGetRawColor()
  const textStyle = useTextStyle()
  return (
    <RawHeader_
      title={props.title}
      headerStyle={
        props.headerStyle
          ? {
              backgroundColor: pipe(props.headerStyle.backgroundColor, c =>
                c ? getRawColor(c) : undefined,
              ),
            }
          : undefined
      }
      headerTitleStyle={{
        color: pipe(
          props.headerTitleStyle?.color ?? textStyle.color,
          getRawColor,
        ),
      }}
      headerLeft={props.headerLeft ? constant(props.headerLeft) : undefined}
      headerRight={props.headerRight ? constant(props.headerRight) : undefined}
      headerShadowVisible={false}
    />
  )
}
