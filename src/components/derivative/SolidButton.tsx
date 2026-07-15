import { pipe } from 'effect'
import { Pressable } from 'src/components'
import { TextStyleContextProvider } from 'src/contexts/TextStyle'
import { useTheme } from 'src/contexts/Theme'
import type { Color } from 'src/utils/datatypes/Color'
import type { PressableProps } from '../react-native/Pressable'

export const SolidButton = (
  props: PressableProps & {
    color?: Color
    textColor?: Color
  },
) => {
  const { colors } = useTheme()
  return (
    <Pressable
      {...props}
      p={props.p ?? 12}
      round={props.round ?? 4}
      bg={
        props.bg ??
        pipe(props.color ?? colors.primary, c =>
          props.isEnabled === false ? colors.tone(-0.55)(c) : c,
        )
      }
      rippleColor={props.rippleColor ?? colors.black}
      rippleOpacity={props.rippleOpacity ?? 0.5}
    >
      <TextStyleContextProvider
        value={{
          color: pipe(props.textColor ?? colors.text.light, c =>
            props.isEnabled === false ? colors.tone(-0.55)(c) : c,
          ),
        }}
      >
        {props.children}
      </TextStyleContextProvider>
    </Pressable>
  )
}
