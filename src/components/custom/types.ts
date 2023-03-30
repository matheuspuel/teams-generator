import React from 'react'

export type Element = React.ReactElement

export type JSXElementsChildren = Element | ReadonlyArray<Element>

type Axis = 'x' | 'y'

type DirectionX = 'l' | 'r'

type DirectionY = 't' | 'b'

type Direction = DirectionX | DirectionY

type Spacing = number

type LineWidth = number

export type PaddingProps = {
  [k in `p${'' | Direction | Axis}`]?: Spacing
}

export type MarginProps = {
  [k in `m${'' | Direction | Axis}`]?: Spacing
}

export type BorderWidthProps = {
  [k in `borderWidth${Uppercase<'' | Direction | Axis>}`]?: LineWidth
}

export type RoundProps = {
  [k in `round${
    | ''
    | `${Uppercase<DirectionY>}${Uppercase<DirectionX>}`}`]?: number
} & (
  | ({
      [k in `round${Uppercase<DirectionX>}`]?: number
    } & {
      [k in `round${Uppercase<DirectionY>}`]?: never
    })
  | ({
      [k in `round${Uppercase<DirectionX>}`]?: never
    } & {
      [k in `round${Uppercase<DirectionY>}`]?: number
    })
)

export type GapProps = {
  [k in `gap${Uppercase<'' | Axis>}`]?: Spacing
}

export type FlexContainerProps = {
  direction?: 'row' | 'column'
  justify?:
    | 'center'
    | 'start'
    | 'end'
    | 'space-between'
    | 'space-around'
    | 'space-evenly'
  align?: 'start' | 'end' | 'center' | 'stretch'
}

export type FlexChildProps = {
  flex?: number
  alignSelf?: 'start' | 'end' | 'center' | 'stretch'
}

export type AbsolutePositionProps = {
  absolute?:
    | false
    | { left?: number; right?: number; top?: number; bottom?: number }
}
