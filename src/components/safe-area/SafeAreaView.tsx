import { pipe } from 'effect'
import * as React from 'react'
import {
  type Edges,
  SafeAreaView as SafeAreaView_,
} from 'react-native-safe-area-context'
import { useThemeGetRawColor } from 'src/contexts/Theme'
import type { ViewProps } from '../react-native/View'

export type SafeAreaViewProps = ViewProps & {
  mode?: 'padding' | 'margin'
  edges?: Edges
  children?: React.ReactNode
}

export const SafeAreaView = (props: SafeAreaViewProps = {}) => {
  const getRawColor = useThemeGetRawColor()
  return (
    <SafeAreaView_
      children={props.children}
      onLayout={props.onLayout}
      mode={props.mode}
      edges={props.edges}
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
        borderWidth: props?.borderWidth,
        borderLeftWidth: props?.borderWidthL ?? props?.borderWidthX,
        borderRightWidth: props?.borderWidthR ?? props?.borderWidthX,
        borderTopWidth: props?.borderWidthT ?? props?.borderWidthY,
        borderBottomWidth: props?.borderWidthB ?? props?.borderWidthY,
        borderRadius: props?.round,
        borderTopLeftRadius: props?.roundTL ?? props?.roundT ?? props?.roundL,
        borderTopRightRadius: props?.roundTR ?? props?.roundT ?? props?.roundR,
        borderBottomLeftRadius:
          props?.roundBL ?? props?.roundB ?? props?.roundL,
        borderBottomRightRadius:
          props?.roundBR ?? props?.roundB ?? props?.roundR,
        gap: props?.gap,
        rowGap: props?.gapX,
        columnGap: props?.gapY,
        width: props?.w,
        height: props?.h,
        minWidth: props?.minW,
        minHeight: props?.minH,
        aspectRatio: props?.aspectRatio,
        flex: props?.flex,
        flexDirection: props?.direction,
        backgroundColor: props?.bg ? getRawColor(props.bg) : undefined,
        borderColor: props?.borderColor
          ? getRawColor(props.borderColor)
          : undefined,
        justifyContent:
          props?.justify === 'start'
            ? 'flex-start'
            : props?.justify === 'end'
              ? 'flex-end'
              : props?.justify,
        alignItems:
          props?.align === 'start'
            ? 'flex-start'
            : props?.align === 'end'
              ? 'flex-end'
              : props?.align,
        alignSelf:
          props?.alignSelf === 'start'
            ? 'flex-start'
            : props?.alignSelf === 'end'
              ? 'flex-end'
              : props?.alignSelf,
        elevation: props?.shadow,
        ...pipe(
          props?.absolute
            ? { ...props.absolute, position: 'absolute' }
            : props?.absolute === false
              ? { position: 'relative' }
              : undefined,
        ),
        zIndex: props?.zIndex,
        overflow: props?.overflow,
      }}
    />
  )
}
