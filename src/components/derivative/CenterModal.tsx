import { router, Stack } from 'expo-router'
import { MaterialIcons, Pressable, Row, Txt, View } from 'src/components'
import { useTheme } from 'src/contexts/Theme'

export const CenterModal = (props: {
  title?: string
  m?: number
  children: React.ReactNode
}) => {
  const { colors } = useTheme()
  return (
    <Pressable
      onPress={() => router.back()}
      flex={1}
      justify="center"
      bg={colors.black.setOpacityFactor(0.375)}
      rippleColor={colors.black}
      rippleOpacity={0}
    >
      <Pressable
        onPress={() => {}}
        m={props.m ?? 48}
        round={8}
        bg={colors.card}
        rippleColor={colors.black}
        rippleOpacity={0}
      >
        <Stack.Screen
          options={{
            presentation: 'transparentModal',
            contentStyle: { backgroundColor: 'transparent' },
            animation: 'fade',
            headerShown: false,
          }}
        />
        {props.title ? (
          <>
            <Header title={props.title} />
            <View
              borderWidthT={1}
              borderColor={colors.gray.setOpacityFactor(0.375)}
            />
          </>
        ) : null}
        {props.children}
      </Pressable>
    </Pressable>
  )
}

const Header = (props: { title: string }) => {
  const { colors } = useTheme()
  return (
    <Row align="center" p={8}>
      <Txt flex={1} align="left" m={8} size={16} weight={600}>
        {props.title}
      </Txt>
      <Pressable p={8} round={4} onPress={() => router.back()}>
        <MaterialIcons name="close" color={colors.gray} />
      </Pressable>
    </Row>
  )
}
