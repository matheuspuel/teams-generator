import { MaterialIcons, Modal, Pressable, Row, Txt, View } from 'src/components'
import { AppEvent } from 'src/runtime'
import { Colors } from 'src/services/Theme'

export const CenterModal = (props: {
  onClose: AppEvent
  visible?: boolean
  title?: string
  m?: number
  children: React.ReactNode
}) => (
  <Modal onClose={props.onClose} m={props.m ?? 48}>
    {props.title ? (
      <>
        <Header title={props.title} onClose={props.onClose} />
        <View
          borderWidthT={1}
          borderColor={Colors.opacity(0.375)(Colors.gray)}
        />
      </>
    ) : null}
    {props.children}
  </Modal>
)

const Header = (props: { title: string; onClose: AppEvent }) => (
  <Row align="center" p={8}>
    <Txt flex={1} align="left" m={8} size={16} weight={600}>
      {props.title}
    </Txt>
    <Pressable p={8} round={4} onPress={props.onClose}>
      <MaterialIcons name="close" color={Colors.gray} />
    </Pressable>
  </Row>
)
