import {
  Effect,
  Option,
  ReadonlyArray,
  ReadonlyRecord,
  flow,
  pipe,
} from 'effect'
import { Modality } from 'src/datatypes'
import { soccer } from 'src/datatypes/Modality'
import { root } from 'src/model/optic'
import { IdGenerator } from 'src/services/IdGenerator'
import { State, StateRef } from 'src/services/StateRef'
import { adjustPlayerPosition, getModality } from 'src/slices/groups'
import {
  blankPositionForm,
  initialModalityForm,
  validateModalityForm,
} from 'src/slices/modalityForm'
import { Route, goBack, navigate } from 'src/slices/routes'
import { toNonEmpty } from 'src/utils/fp/Array'
import { nonEmptyIndex } from 'src/utils/fp/Optic'
import { back } from './core'

export const goToModality = StateRef.execute(
  Effect.all([goBack, navigate(Route.Modalities())]),
)

export const newModality = StateRef.execute(
  Effect.all([
    State.on(root.at('modalityForm')).set(initialModalityForm),
    navigate(Route.ModalityForm()),
  ]),
)

export const openModality = (modality: Modality.Reference) =>
  pipe(
    State.with(getModality(modality)),
    Effect.flatten,
    Effect.flatMap(m =>
      m._tag === 'StaticModality' ? Option.none() : Option.some(m),
    ),
    Effect.tap(m =>
      State.on(root.at('modalityForm')).set({
        id: Option.some(m.id),
        name: m.name,
        positions: ReadonlyArray.map(m.positions, p => ({
          abbreviation: p.abbreviation.toUpperCase(),
          name: p.name,
          oldAbbreviation: Option.some(p.abbreviation),
        })),
      }),
    ),
    Effect.tap(() => navigate(Route.ModalityForm())),
    StateRef.execute,
    Effect.ignore,
  )

export const submitModality = pipe(
  State.with(s => s.modalityForm),
  Effect.flatMap(validateModalityForm),
  Effect.flatMap(f =>
    Effect.all({
      _tag: Effect.succeed('CustomModality' as const),
      id: Effect.orElse(f.id, () => IdGenerator.generate()),
      name: Effect.succeed(f.name),
      positions: Effect.succeed(f.positions),
    }),
  ),
  Effect.bindTo('nextModality'),
  Effect.bind('prevModality', ({ nextModality }) =>
    State.with(getModality({ _tag: 'CustomModality', id: nextModality.id })),
  ),
  Effect.tap(({ nextModality }) =>
    State.on(root.at('customModalities')).update(ms =>
      pipe(
        ReadonlyArray.filter(ms, m => m.id !== nextModality.id),
        ReadonlyArray.prepend(nextModality),
      ),
    ),
  ),
  Effect.tap(({ nextModality, prevModality }) =>
    pipe(
      prevModality,
      Effect.tap(prevModality =>
        State.on(root.at('groups')).update(
          ReadonlyRecord.map(g =>
            g.modality.id === prevModality.id
              ? {
                  ...g,
                  players: ReadonlyArray.map(
                    g.players,
                    adjustPlayerPosition({
                      prevModality: Option.some(prevModality),
                      nextModality: {
                        _tag: 'edited',
                        modality: nextModality,
                      },
                    }),
                  ),
                }
              : g,
          ),
        ),
      ),
      Effect.optionFromOptional,
    ),
  ),
  StateRef.execute,
  Effect.tap(() => back),
  Effect.ignore,
)

export const openRemoveModality = pipe(
  State.with(s => s.modalityForm.id),
  Effect.flatMap(
    Option.match({
      onNone: () => goBack,
      onSome: () => navigate(Route.DeleteModality()),
    }),
  ),
  StateRef.execute,
)

export const removeModality = pipe(
  State.with(s => s.modalityForm.id),
  Effect.flatten,
  Effect.flatMap(id => State.with(getModality({ _tag: 'CustomModality', id }))),
  Effect.flatten,
  Effect.bindTo('prevModality'),
  Effect.tap(({ prevModality }) =>
    State.on(root.at('customModalities')).update(
      ReadonlyArray.filter(m => m.id !== prevModality.id),
    ),
  ),
  Effect.bind('nextModality', () =>
    State.with(s =>
      ReadonlyArray.head(s.customModalities).pipe(
        Option.getOrElse(() => soccer),
      ),
    ),
  ),
  Effect.tap(({ nextModality, prevModality }) =>
    State.on(root.at('groups')).update(
      ReadonlyRecord.map(g =>
        g.modality.id === prevModality.id
          ? {
              ...g,
              modality:
                nextModality._tag === 'CustomModality'
                  ? { _tag: nextModality._tag, id: nextModality.id }
                  : { _tag: nextModality._tag, id: nextModality.id },
              players: ReadonlyArray.map(
                g.players,
                adjustPlayerPosition({
                  prevModality: Option.some(prevModality),
                  nextModality: {
                    _tag: 'unchanged',
                    modality: nextModality,
                  },
                }),
              ),
            }
          : g,
      ),
    ),
  ),
  Effect.tap(() => goBack),
  Effect.tap(() => goBack),
  StateRef.execute,
  Effect.ignore,
)

export const changeModalityName = flow(
  State.on(root.at('modalityForm').at('name')).set,
  StateRef.execute,
)

export const addModalityPosition = StateRef.execute(
  State.on(root.at('modalityForm').at('positions')).update(
    ReadonlyArray.append(blankPositionForm),
  ),
)

export const removeModalityPosition = (index: number) =>
  StateRef.execute(
    State.on(root.at('modalityForm').at('positions')).update(
      flow(
        ReadonlyArray.remove(index),
        toNonEmpty,
        Option.getOrElse(() => ReadonlyArray.of(blankPositionForm)),
      ),
    ),
  )

export const liftModalityPosition = (index: number) =>
  StateRef.execute(
    State.on(root.at('modalityForm').at('positions')).update(as =>
      pipe(
        ReadonlyArray.get(as, index),
        Option.flatMap(a =>
          pipe(
            ReadonlyArray.remove(as, index),
            ReadonlyArray.insertAt(index - 1, a),
          ),
        ),
        Option.getOrElse(() => as),
      ),
    ),
  )

export const changeModalityPositionAbbreviation = (args: {
  index: number
  value: string
}) =>
  StateRef.execute(
    State.onOption(
      root
        .at('modalityForm')
        .at('positions')
        .compose(nonEmptyIndex(args.index))
        .at('abbreviation'),
    ).set(args.value.slice(0, 3).toUpperCase()),
  )

export const changeModalityPositionName = (args: {
  index: number
  value: string
}) =>
  StateRef.execute(
    State.onOption(
      root
        .at('modalityForm')
        .at('positions')
        .compose(nonEmptyIndex(args.index))
        .at('name'),
    ).set(args.value),
  )
