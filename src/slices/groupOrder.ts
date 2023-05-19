import { $, $f, O, S } from 'fp'
import { GroupOrder } from 'src/datatypes'
import { GroupOrderType } from 'src/datatypes/GroupOrder'
import { root } from 'src/model/Optics'
import { modifySApp, replaceSApp } from 'src/services/StateRef'
import { A } from 'src/utils/fp'

const selectGroupOrder =
  (option: GroupOrderType) =>
  (state: GroupOrder): GroupOrder =>
    $(state, A.unprepend, ([a, as]) =>
      a._tag === option
        ? $(as, A.prepend({ _tag: a._tag, reverse: !a.reverse }))
        : $(
            as,
            A.filter(b => b._tag !== option),
            A.prepend(a),
            A.prepend({ _tag: option, reverse: false }),
          ),
    )

export const onSelectGroupOrder = $f(
  selectGroupOrder,
  modifySApp(root.groupOrder.$),
  S.apFirst(replaceSApp(root.ui.modalSortGroup.$)(O.none())),
)
