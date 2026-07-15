import { MaterialIcons, Pressable, View } from 'src/components'
import { useTheme } from 'src/contexts/Theme'
import type { Color } from 'src/utils/datatypes/Color'
import type { PressableProps } from '../react-native/Pressable'

export const Checkbox = (
  props: Omit<PressableProps, 'onPress' | 'children'> & {
    onToggle: () => void
    isSelected: boolean
    pressPadding?: number
    color?: Color
  },
) => {
  const { colors } = useTheme()
  return (
    <Pressable
      onPress={props.onToggle}
      borderless={true}
      rippleOpacity={0.15}
      {...props}
      rippleColor={props.color ?? colors.primary}
      p={(props.pressPadding ?? 8) + (props.p ?? 0)}
      m={(props.pressPadding ?? -8) + (props.m ?? 0)}
    >
      {props.isSelected ? (
        <View
          borderWidth={2}
          round={4}
          h={28}
          w={28}
          bg={props.color ?? colors.primary}
          borderColor={props.color ?? colors.primary}
        >
          <MaterialIcons name="check" color={colors.white} />
        </View>
      ) : (
        <View
          borderWidth={2}
          round={4}
          borderColor={colors.gray.setOpacityFactor(0.5)}
          h={28}
          w={28}
        />
      )}
    </Pressable>
  )
}
