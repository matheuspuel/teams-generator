import { Array, Match, pipe } from 'effect'
import { StatusBar } from 'expo-status-bar'
import { StyleSheet } from 'react-native'
import { ScreenStack } from 'react-native-screens'
import { mergeModalsToScreens, modal, screen } from 'src/components/routing'
import { SafeAreaProvider } from 'src/components/safe-area/SafeAreaProvider'
import { Screen } from 'src/components/screens/Screen'
import { useSelector } from 'src/hooks/useSelector'
import { Colors } from 'src/services/Theme'
import { GroupView } from 'src/views/Group'
import { GroupsView } from 'src/views/Groups'
import { PlayerView } from 'src/views/PlayerForm'
import { ResultView } from 'src/views/Result'
import { DeleteGroupView } from './DeleteGroup'
import { DeleteModalityView } from './DeleteModality'
import { GroupFormView } from './GroupForm'
import { GroupMenuView } from './GroupMenu'
import { HomeMenuView } from './HomeMenu'
import { ModalitiesView } from './Modalities'
import { ModalityFormView } from './ModalityForm'
import { ParametersView } from './Parameters'
import { SortGroupView } from './SortGroup'

export const Router = () => {
  const route = useSelector(s => s.route)
  return (
    <SafeAreaProvider bg={Colors.background}>
      <StatusBar style="light" />
      <ScreenStack style={StyleSheet.absoluteFill}>
        {pipe(
          route,
          Array.map(r =>
            Match.valueTags(r, {
              Groups: screen(() => <GroupsView />),
              Modalities: screen(() => <ModalitiesView />),
              Group: screen(() => <GroupView />),
              GroupForm: screen(() => <GroupFormView />),
              ModalityForm: screen(() => <ModalityFormView />),
              Player: screen(() => <PlayerView />),
              Result: screen(() => <ResultView />),

              DeleteGroup: modal(() => <DeleteGroupView />),
              DeleteModality: modal(() => <DeleteModalityView />),
              Parameters: modal(() => <ParametersView />),
              SortGroup: modal(() => <SortGroupView />),
              HomeMenu: modal(() => <HomeMenuView />),
              GroupMenu: modal(() => <GroupMenuView />),
            }),
          ),
          mergeModalsToScreens,
          Array.map((children, i) => <Screen key={i}>{children}</Screen>),
        )}
      </ScreenStack>
    </SafeAreaProvider>
  )
}
