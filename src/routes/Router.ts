import { get } from '@fp-ts/optic'
import { StatusBar } from 'src/components/hyperscript/expo/StatusBar'
import { SafeAreaProvider } from 'src/components/hyperscript/safe-area/SafeAreaProvider'
import { Screen } from 'src/components/hyperscript/screens/Screen'
import { ScreenStack } from 'src/components/hyperscript/screens/ScreenStack'
import { RootState } from 'src/model'
import { Colors } from 'src/services/Theme'
import { getGroupById } from 'src/slices/groups'
import { ParametersLens } from 'src/slices/parameters'
import { PlayerFormLens } from 'src/slices/playerForm'
import { ResultLens } from 'src/slices/result'
import { UiLens } from 'src/slices/ui'
import { $, O, absurd } from 'src/utils/fp'
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
                    get(UiLens.at('selectedGroupId'))(model),
                    O.match(
                      () => O.none,
                      id => getGroupById(id)(model),
                    ),
                  ),
                  modalParameters: get(UiLens.at('modalParameters'))(model),
                  parameters: get(ParametersLens)(model),
                }),
              ]),
              ...(route === 'Group'
                ? []
                : route === 'Player'
                ? [Screen()([PlayerView({ form: get(PlayerFormLens)(model) })])]
                : route === 'Result'
                ? [Screen()([ResultView({ result: get(ResultLens)(model) })])]
                : absurd<never>(route)),
            ],
      ),
    ]),
  ])
