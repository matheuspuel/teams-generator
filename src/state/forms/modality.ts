import { Form } from '@matheuspuel/state-machine'
import { makeStateMachineContext } from '@matheuspuel/state-machine/react'
import { Array, Option, pipe } from 'effect'
import { Abbreviation } from 'src/datatypes/Position'

const modalityFormStateMachine = Form.Struct({
  name: Form.Field.TrimNonEmptyString,
  positions: Form.Array(
    Form.Struct({
      oldAbbreviation: Form.Field.nullOr<Abbreviation>(),
      abbreviation: Form.Field.TrimNonEmptyString.transform(_ =>
        _.toLowerCase(),
      ).transform(Abbreviation),
      name: Form.Field.TrimNonEmptyString,
    }),
  ).mapActions((actions, { Store }) => ({
    ...actions,
    removeItemKeepingAtLeastOne: (index: number) => {
      actions.removeItem(index)
      if (!Store.get().length) {
        actions.addItem()
      }
    },
    moveUp: (index: number) =>
      Store.update(as =>
        pipe(
          Array.get(as, index),
          Option.flatMap(a =>
            pipe(Array.remove(as, index), Array.insertAt(index - 1, a)),
          ),
          Option.getOrElse(() => as),
        ),
      ),
  })),
}).mapActions(actions => ({
  ...actions,
  setStateFromData: (_: {
    name: string
    positions: readonly { abbreviation: Abbreviation; name: string }[]
  }) =>
    actions.setStateFromData({
      ..._,
      positions: _.positions.map(_ => ({
        ..._,
        oldAbbreviation: _.abbreviation,
      })),
    }),
}))

export const ModalityForm = makeStateMachineContext(modalityFormStateMachine)
