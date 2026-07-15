import * as React from 'react'
import { TextInput as RNTextInput_ } from 'react-native-gesture-handler'
import type {
  BorderWidthProps,
  FlexChildProps,
  MarginProps,
  PaddingProps,
  RoundProps,
} from 'src/components/types'
import type { Color } from 'src/utils/datatypes/Color'

export type TextInputStyleProps = PaddingProps &
  MarginProps &
  BorderWidthProps &
  RoundProps &
  FlexChildProps & {
    w?: number
    h?: number
    bg?: Color
    borderColor?: Color
    fontColor?: Color
    fontSize?: number
  }

export type TextInputProps = TextInputStyleProps & {
  value: string
  onChange: (value: string) => void
  onFocus?: () => void
  onBlur?: () => void
  ref?: React.RefObject<RNTextInput_>
  autoFocus?: boolean
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'
  align?: 'left' | 'center' | 'right' | 'justify' | 'auto'
  placeholder?: string
  placeholderTextColor?: Color
  cursorColor?: Color
  focused?: {
    bg?: Color
    borderColor?: Color
  }
}

export const TextInput = (props: TextInputProps) => {
  const [isFocused, setIsFocused] = React.useState(false)
  return (
    <RNTextInput_
      value={props.value}
      onChangeText={props.onChange}
      onFocus={() => {
        setIsFocused(true)
        if (props.onFocus) props.onFocus()
      }}
      onBlur={() => {
        setIsFocused(false)
        if (props.onBlur) props.onBlur()
      }}
      ref={props.ref}
      autoFocus={props.autoFocus}
      autoCapitalize={props.autoCapitalize}
      placeholder={props.placeholder}
      placeholderTextColor={props.placeholderTextColor?.toHex()}
      cursorColor={props.cursorColor?.toHex()}
      style={{
        color: props.fontColor?.toHex(),
        textAlign: props.align,
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
        width: props?.w,
        height: props?.h,
        flex: props?.flex,
        flexGrow: props?.flexGrow,
        flexShrink: props?.flexShrink,
        backgroundColor: (
          (isFocused && props.focused?.bg) ||
          props.bg
        )?.toHex(),
        borderColor: (
          (isFocused && props.focused?.borderColor) ||
          props.borderColor
        )?.toHex(),
        alignSelf:
          props?.alignSelf === 'start'
            ? 'flex-start'
            : props?.alignSelf === 'end'
              ? 'flex-end'
              : props?.alignSelf,
      }}
    />
  )
}
