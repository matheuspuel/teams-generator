import { get } from '@fp-ts/optic'
import { $, absurd, Apply, O, R } from 'fp'
import { StatusBar } from 'src/components/expo/StatusBar'
import { named2 } from 'src/components/helpers'
import { SafeAreaProvider } from 'src/components/safe-area/SafeAreaProvider'
import { Screen } from 'src/components/screens/Screen'
import { ScreenStack } from 'src/components/screens/ScreenStack'
import { RootState } from 'src/model'
import { root } from 'src/model/Optics'
import { Colors } from 'src/services/Theme'
import { getGroupById } from 'src/slices/groups'
import { GroupView } from 'src/views/Group'
import { Groups } from 'src/views/Groups'
import { PlayerView } from 'src/views/PlayerForm'
import { ResultView } from 'src/views/Result'

export const Router = named2('Router')(({ model }: { model: RootState }) =>
  SafeAreaProvider({ bg: Colors.background })([
    StatusBar({ style: 'light' }),
    ScreenStack()([
      Screen()([Groups({ groups: model.groups, ui: model.ui })]),
      ...$(model.route, route =>
        route === 'Groups'
          ? []
          : [
              Screen()([
                GroupView(
                  Apply.sequenceS(R.Apply)({
                    group: $(
                      get(root.ui.selectedGroupId.$),
                      R.chain(O.match(() => R.of(O.none()), getGroupById)),
                    ),
                    modalSortGroup: get(root.ui.modalSortGroup.$),
                    modalParameters: get(root.ui.modalParameters.$),
                    parameters: get(root.parameters.$),
                    groupOrder: get(root.groupOrder.$),
                  })(model),
                ),
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
  ]),
)
