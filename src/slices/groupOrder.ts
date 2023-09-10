import { F, O, flow, pipe } from 'fp'
import { GroupOrder } from 'src/datatypes'
import { GroupOrderType } from 'src/datatypes/GroupOrder'
import { root } from 'src/model/optic'
import { State } from 'src/services/StateRef'
import { A } from 'src/utils/fp'

const selectGroupOrder =
  (option: GroupOrderType) =>
  (state: GroupOrder): GroupOrder =>
    pipe(state, A.unprepend, ([a, as]) =>
      a._tag === option
        ? pipe(as, A.prepend({ _tag: a._tag, reverse: !a.reverse }))
        : pipe(
            as,
            A.filter(b => b._tag !== option),
            A.prepend(a),
            A.prepend({ _tag: option, reverse: false }),
          ),
    )

export const onSelectGroupOrder = flow(
  selectGroupOrder,
  State.on(root.at('groupOrder')).update,
  F.tap(() => State.on(root.at('ui').at('modalSortGroup')).set(O.none())),
)
