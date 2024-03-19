import { Effect, ReadonlyArray, flow, pipe } from 'effect'
import { GroupOrder } from 'src/datatypes'
import { GroupOrderType } from 'src/datatypes/GroupOrder'
import { root } from 'src/model/optic'
import { State } from 'src/services/StateRef'
import { goBack } from './routes'

const selectGroupOrder =
  (option: GroupOrderType) =>
  (state: GroupOrder): GroupOrder =>
    pipe(state, ReadonlyArray.unprepend, ([a, as]) =>
      a._tag === option
        ? pipe(as, ReadonlyArray.prepend({ _tag: a._tag, reverse: !a.reverse }))
        : pipe(
            as,
            ReadonlyArray.filter(b => b._tag !== option),
            ReadonlyArray.prepend(a),
            ReadonlyArray.prepend({ _tag: option, reverse: false }),
          ),
    )

export const onSelectGroupOrder = flow(
  selectGroupOrder,
  State.on(root.at('groupOrder')).update,
  Effect.tap(goBack),
)
