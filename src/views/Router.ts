import { get } from '@fp-ts/optic'
import { StatusBar } from 'src/components/hyperscript/expo/StatusBar'
import { SafeAreaProvider } from 'src/components/hyperscript/safe-area/SafeAreaProvider'
import { Screen } from 'src/components/hyperscript/screens/Screen'
import { ScreenStack } from 'src/components/hyperscript/screens/ScreenStack'
import { RootState } from 'src/model'
import { root } from 'src/model/Optics'
import { Colors } from 'src/services/Theme'
import { getGroupById } from 'src/slices/groups'
import { $, absurd, O } from 'src/utils/fp'
import { GroupView } from 'src/views/Group'
import { Groups } from 'src/views/Groups'
import { PlayerView } from 'src/views/PlayerForm'
import { ResultView } from 'src/views/Result'

export const Router = ({ model }: { model: RootState }) =>
  SafeAreaProvider({ bg: Colors.background })([
    StatusBar({ style: 'light' }),
    ScreenStack()([
      Screen()([Groups({ groups: model.groups, ui: model.ui })]),
      ...$(model.route, route =>
        route === 'Groups'
          ? []
          : [
              Screen()([
                GroupView({
                  group: $(
                    get(root.ui.selectedGroupId.$)(model),
                    O.match(
                      () => O.none,
                      id => getGroupById(id)(model),
                    ),
                  ),
                  modalParameters: get(root.ui.modalParameters.$)(model),
                  parameters: get(root.parameters.$)(model),
                }),
              ]),
              ...(route === 'Group'
                ? []
                : route === 'Player'
                ? [
                    Screen()([
                      PlayerView({ form: get(root.playerForm.$)(model) }),
                    ]),
                  ]
                : route === 'Result'
                ? [
                    Screen()([
                      ResultView({ result: get(root.result.$)(model) }),
                    ]),
                  ]
                : absurd<never>(route)),
            ],
      ),
    ]),
  ])
