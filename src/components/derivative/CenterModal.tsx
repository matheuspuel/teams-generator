import { router, Stack } from 'expo-router'
import { MaterialIcons, Pressable, Row, Txt, View } from 'src/components'
import { Colors } from 'src/services/Theme'

export const CenterModal = (props: {
  title?: string
  m?: number
  children: React.ReactNode
}) => (
  <Pressable
    onPress={() => router.back()}
    flex={1}
    justify="center"
    bg={Colors.opacity(0.375)(Colors.black)}
    rippleColor={Colors.black}
    rippleOpacity={0}
  >
    <Pressable
      onPress={() => {}}
      m={props.m ?? 48}
      round={8}
      bg={Colors.card}
      rippleColor={Colors.black}
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
            borderColor={Colors.opacity(0.375)(Colors.gray)}
          />
        </>
      ) : null}
      {props.children}
    </Pressable>
  </Pressable>
)

const Header = (props: { title: string }) => (
  <Row align="center" p={8}>
    <Txt flex={1} align="left" m={8} size={16} weight={600}>
      {props.title}
    </Txt>
    <Pressable p={8} round={4} onPress={() => router.back()}>
      <MaterialIcons name="close" color={Colors.gray} />
    </Pressable>
  </Row>
)
