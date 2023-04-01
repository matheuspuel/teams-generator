import { $, Optic } from 'fp'
import { RootState } from 'src/model'
import { Id } from 'src/utils/Entity'

export const $op = $(Optic.id<RootState>(), root => ({
  $: root,
  core: {
    loaded: { $: root.at('core').at('isLoaded') },
  },
  route: { $: root.at('route') },
  groups: $(root.at('groups'), groups => ({
    $: groups,
    id: (id: Id) =>
      $(groups.key(id), group => ({
        $: group,
        players: $(group.at('players'), players => ({
          $: players,
          id: (id: Id) =>
            $(players.compose(Optic.findFirst(p => p.id === id)), player => ({
              $: player,
              active: { $: player.at('active') },
            })),
        })),
      })),
  })),
  parameters: { $: root.at('parameters') },
  result: { $: root.at('result') },
  playerForm: $(root.at('playerForm'), playerForm => ({
    $: playerForm,
    name: { $: playerForm.at('name') },
    position: { $: playerForm.at('position') },
    rating: { $: playerForm.at('rating') },
  })),
  ui: $(root.at('ui'), ui => ({
    $: ui,
    selectedGroupId: { $: ui.at('selectedGroupId') },
    selectedPlayerId: { $: ui.at('selectedPlayerId') },
    modalParameters: { $: ui.at('modalParameters') },
    modalUpsertGroup: $(ui.at('modalUpsertGroup'), modalUpsertGroup => ({
      $: modalUpsertGroup,
      name: { $: modalUpsertGroup.compose(Optic.some()).at('name') },
    })),
    modalDeleteGroup: { $: ui.at('modalDeleteGroup') },
  })),
}))
