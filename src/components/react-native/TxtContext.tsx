import * as React from 'react'
import { Text as RNText_ } from 'react-native'
import { TextStyleContextProvider } from 'src/contexts/TextStyle'
import type { Color } from 'src/utils/datatypes/Color'
import type { TextProps } from './Txt'

export type TxtContextArgs = {
  x?: TextProps
  children?: React.ReactNode
  getRawColor: (color: Color) => string
}

export const TxtContext = (
  props: Omit<TextProps, 'children'> & { children: React.ReactNode },
) => {
  const element = (
    <RNText_
      children={props.children}
      numberOfLines={props?.numberOfLines}
      style={{
        padding: props?.p,
        paddingHorizontal: props?.px,
        paddingVertical: props?.py,
        paddingLeft: props?.pl,
        paddingRight: props?.pr,
        paddingTop: props?.pt,
        paddingBottom: props?.pb,
        margin: props?.m,
        marginHorizontal: props?.mx,
        marginVertical: props?.my,
        marginLeft: props?.ml,
        marginRight: props?.mr,
        marginTop: props?.mt,
        marginBottom: props?.mb,
        width: props?.w,
        height: props?.h,
        flex: props?.flex,
        color: props?.color?.toHex(),
        textAlign: props?.align ?? 'center',
        fontSize: props?.size,
        fontWeight: props?.weight ? `${props.weight}` : undefined,
        lineHeight: props?.lineHeight,
      }}
    />
  )
  return props.color ? (
    <TextStyleContextProvider value={{ color: props.color }}>
      {element}
    </TextStyleContextProvider>
  ) : (
    element
  )
}
