import { get } from '@fp-ts/optic'
import { A, Match, O, pipe } from 'fp'
import { Nothing } from 'src/components'
import { AlertToast } from 'src/components/derivative/AlertToast'
import { StatusBar } from 'src/components/expo/StatusBar'
import { named2 } from 'src/components/helpers'
import { SafeAreaProvider } from 'src/components/safe-area/SafeAreaProvider'
import { Screen } from 'src/components/screens/Screen'
import { ScreenStack } from 'src/components/screens/ScreenStack'
import { RootState } from 'src/model'
import { root } from 'src/model/optic'
import { Colors } from 'src/services/Theme'
import { getGroupById } from 'src/slices/groups'
import { GroupView } from 'src/views/Group'
import { Groups } from 'src/views/Groups'
import { PlayerView } from 'src/views/PlayerForm'
import { ResultView } from 'src/views/Result'

export const Router = named2('Router')(({ model }: { model: RootState }) =>
  SafeAreaProvider({ bg: Colors.background })([
    StatusBar({ style: 'light' }),
    ScreenStack()(
      A.map(
        model.route,
        Match.valueTags({
          Groups: () =>
            Screen()([Groups({ groups: model.groups, ui: model.ui })]),
          Group: () =>
            Screen()([
              GroupView({
                group: pipe(
                  model.ui.selectedGroupId,
                  O.flatMap(id => getGroupById(id)(model)),
                ),
                modalSortGroup: model.ui.modalSortGroup,
                modalParameters: model.ui.modalParameters,
                parameters: model.parameters,
                groupOrder: model.groupOrder,
                menu: model.ui.groupMenu,
              }),
            ]),
          Player: () =>
            Screen()([PlayerView({ form: get(root.at('playerForm'))(model) })]),
          Result: () =>
            Screen()([ResultView({ result: get(root.at('result'))(model) })]),
        }),
      ),
    ),
    O.match(model.alert, {
      onNone: () => Nothing,
      onSome: alert => AlertToast(alert),
    }),
  ]),
)
