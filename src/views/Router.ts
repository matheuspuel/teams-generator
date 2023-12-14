import { A, Match, flow, pipe } from 'fp'
import { StatusBar } from 'src/components/expo/StatusBar'
import { memoizedConst } from 'src/components/hyperscript'
import { mergeModalsToScreens, modal, screen } from 'src/components/routing'
import { SafeAreaProvider } from 'src/components/safe-area/SafeAreaProvider'
import { Screen } from 'src/components/screens/Screen'
import { ScreenStack } from 'src/components/screens/ScreenStack'
import { UIElement } from 'src/components/types'
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

export const Router = memoizedConst('Router')(() => {
  const route = useSelector(s => s.route)
  return SafeAreaProvider({ bg: Colors.background })([
    StatusBar({ style: 'light' }),
    pipe(
      route,
      A.map(
        Match.valueTags({
          Groups: screen(() => GroupsView),
          Modalities: screen(() => ModalitiesView),
          Group: screen(() => GroupView),
          GroupForm: screen(() => GroupFormView),
          ModalityForm: screen(() => ModalityFormView),
          Player: screen(() => PlayerView),
          Result: screen(() => ResultView),

          DeleteGroup: modal(() => DeleteGroupView),
          DeleteModality: modal(() => DeleteModalityView),
          Parameters: modal(() => ParametersView),
          SortGroup: modal(() => SortGroupView),
          HomeMenu: modal(() => HomeMenuView),
          GroupMenu: modal(() => GroupMenuView),
        }),
      ),
      mergeModalsToScreens,
      A.map(flow(A.of<UIElement>, Screen())),
      ScreenStack(),
    ),
  ])
})
