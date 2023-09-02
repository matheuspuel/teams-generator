import { get } from '@fp-ts/optic'
import { $, absurd, Apply, O, R } from 'fp'
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
                      get(root.at('ui').at('selectedGroupId')),
                      R.chain(
                        O.match({
                          onNone: () => R.of(O.none()),
                          onSome: getGroupById,
                        }),
                      ),
                    ),
                    modalSortGroup: get(root.at('ui').at('modalSortGroup')),
                    modalParameters: get(root.at('ui').at('modalParameters')),
                    parameters: get(root.at('parameters')),
                    groupOrder: get(root.at('groupOrder')),
                  })(model),
                ),
              ]),
              ...(route === 'Group'
                ? []
                : route === 'Player'
                ? [
                    Screen()([
                      PlayerView({ form: get(root.at('playerForm'))(model) }),
                    ]),
                  ]
                : route === 'Result'
                ? [
                    Screen()([
                      ResultView({ result: get(root.at('result'))(model) }),
                    ]),
                  ]
                : absurd<never>(route)),
            ],
      ),
    ]),
  ]),
)
