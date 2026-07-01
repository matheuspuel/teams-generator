import * as React from 'react'
import { Text as RNText_ } from 'react-native'
import { UIColor } from 'src/components/types'
import { TextStyleContext } from 'src/contexts/TextStyle'
import { useThemeGetRawColor } from 'src/contexts/Theme'
import { TextProps } from './Txt'

export type TxtContextArgs = {
  x?: TextProps
  children?: React.ReactNode
  getRawColor: (color: UIColor) => string
}

export const TxtContext = (
  props: Omit<TextProps, 'children'> & { children: React.ReactNode },
) => {
  const getRawColor = useThemeGetRawColor()
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
        color: props?.color ? getRawColor(props.color) : undefined,
        textAlign: props?.align ?? 'center',
        fontSize: props?.size,
        fontWeight: props?.weight ? `${props.weight}` : undefined,
        lineHeight: props?.lineHeight,
      }}
    />
  )
  return props.color ? (
    <TextStyleContext.Provider value={{ color: props.color }}>
      {element}
    </TextStyleContext.Provider>
  ) : (
    element
  )
}
