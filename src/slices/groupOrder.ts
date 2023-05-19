import { $, $f, O, S } from 'fp'
import { GroupOrder } from 'src/datatypes'
import { GroupOrderType } from 'src/datatypes/GroupOrder'
import { root } from 'src/model/Optics'
import { modifySApp, replaceSApp } from 'src/services/StateRef'
import { RA, RNEA } from 'src/utils/fp'

const selectGroupOrder =
  (option: GroupOrderType) =>
  (state: GroupOrder): GroupOrder =>
    $(state, RNEA.unprepend, ([a, as]) =>
      a._tag === option
        ? $(as, RA.prepend({ _tag: a._tag, reverse: !a.reverse }))
        : $(
            as,
            RA.filter(b => b._tag !== option),
            RA.prepend(a),
            RA.prependW({ _tag: option, reverse: false }),
          ),
    )

export const onSelectGroupOrder = $f(
  selectGroupOrder,
  modifySApp(root.groupOrder.$),
  S.apFirst(replaceSApp(root.ui.modalSortGroup.$)(O.none())),
)
