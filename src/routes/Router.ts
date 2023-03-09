import { get } from '@fp-ts/optic'
import { StyleSheet } from 'react-native'
import { StatusBar } from 'src/components/hyperscript/expo'
import {
  Screen,
  ScreenStack,
} from 'src/components/hyperscript/react-native-screens'
import { SafeAreaProvider } from 'src/components/hyperscript/safe-area-context'
import { AppEnv } from 'src/Env'
import { getGroupById } from 'src/redux/slices/groups'
import { ParametersLens } from 'src/redux/slices/parameters'
import { PlayerFormLens } from 'src/redux/slices/playerForm'
import { ResultLens } from 'src/redux/slices/result'
import { UiLens } from 'src/redux/slices/ui'
import { RootState } from 'src/redux/store'
import { theme } from 'src/theme'
import { $, absurd, O } from 'src/utils/fp'
import { GroupView } from 'src/views/Group'
import { Groups } from 'src/views/Groups'
import { PlayerView } from 'src/views/PlayerForm'
import { ResultView } from 'src/views/Result'

export const Router =
  ({ model }: { model: RootState }) =>
  (env: AppEnv) =>
    SafeAreaProvider({ style: { backgroundColor: theme.colors.background } })([
      StatusBar({ style: 'light' }),
      ScreenStack({ style: StyleSheet.absoluteFill })([
        Screen()([Groups({ groups: model.groups, ui: model.ui })(env)]),
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
                    groupId: get(UiLens.at('selectedGroupId'))(model),
                    modalParameters: get(UiLens.at('modalParameters'))(model),
                    parameters: get(ParametersLens)(model),
                  })(env),
                ]),
                ...(route === 'Group'
                  ? []
                  : route === 'Player'
                  ? [
                      Screen()([
                        PlayerView({
                          form: get(PlayerFormLens)(model),
                          groupId: get(UiLens.at('selectedPlayerId'))(model),
                          id: get(UiLens.at('selectedGroupId'))(model),
                        })(env),
                      ]),
                    ]
                  : route === 'Result'
                  ? [
                      Screen()([
                        ResultView({ result: get(ResultLens)(model) })(env),
                      ]),
                    ]
                  : absurd<never>(route)),
              ],
        ),
      ]),
    ])
