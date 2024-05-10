import { Array, Effect, flow, pipe } from 'effect'
import { GroupOrder } from 'src/datatypes'
import { GroupOrderType } from 'src/datatypes/GroupOrder'
import { root } from 'src/model/optic'
import { State } from 'src/services/StateRef'
import { goBack } from './routes'

const selectGroupOrder =
  (option: GroupOrderType) =>
  (state: GroupOrder): GroupOrder =>
    pipe(state, Array.unprepend, ([a, as]) =>
      a._tag === option
        ? pipe(as, Array.prepend({ _tag: a._tag, reverse: !a.reverse }))
        : pipe(
            as,
            Array.filter(b => b._tag !== option),
            Array.prepend(a),
            Array.prepend({ _tag: option, reverse: false }),
          ),
    )

export const onSelectGroupOrder = flow(
  selectGroupOrder,
  State.on(root.at('groupOrder')).update,
  Effect.tap(goBack),
)
