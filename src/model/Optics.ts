import { $, Optic } from 'fp'
import { RootState } from 'src/model'
import { Id } from 'src/utils/Entity'

export const root = $(Optic.id<RootState>(), o => ({
  $: o,
  core: {
    loaded: { $: o.at('core').at('isLoaded') },
  },
  route: { $: o.at('route') },
  groups: $(o.at('groups'), o => ({
    $: o,
    id: (id: Id) =>
      $(o.key(id), o => ({
        $: o,
        players: $(o.at('players'), o => ({
          $: o,
          id: (id: Id) =>
            $(o.compose(Optic.findFirst(p => p.id === id)), o => ({
              $: o,
              active: { $: o.at('active') },
            })),
        })),
      })),
  })),
  groupOrder: $(o.at('groupOrder'), o => ({ $: o })),
  parameters: $(o.at('parameters'), o => ({
    $: o,
    position: { $: o.at('position') },
    rating: { $: o.at('rating') },
    teamsCount: { $: o.at('teamsCount') },
  })),
  result: { $: o.at('result') },
  playerForm: $(o.at('playerForm'), o => ({
    $: o,
    name: { $: o.at('name') },
    position: { $: o.at('position') },
    rating: { $: o.at('rating') },
  })),
  ui: $(o.at('ui'), o => ({
    $: o,
    selectedGroupId: { $: o.at('selectedGroupId') },
    selectedPlayerId: { $: o.at('selectedPlayerId') },
    modalParameters: { $: o.at('modalParameters') },
    modalUpsertGroup: $(o.at('modalUpsertGroup'), o => ({
      $: o,
      name: { $: o.compose(Optic.some()).at('name') },
    })),
    modalDeleteGroup: { $: o.at('modalDeleteGroup') },
    modalSortGroup: { $: o.at('modalSortGroup') },
  })),
}))
