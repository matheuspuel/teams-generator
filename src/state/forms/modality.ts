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
    }).mapActions(actions => ({
      ...actions,
      setStateFromData: (
        data: Omit<
          Parameters<typeof actions.setStateFromData>[0],
          'oldAbbreviation'
        >,
      ) =>
        actions.setStateFromData({
          ...data,
          oldAbbreviation: data.abbreviation,
        }),
    })),
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
})

export const ModalityForm = makeStateMachineContext(modalityFormStateMachine)
