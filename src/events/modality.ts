import { Array, Effect, Option, Record, flow, pipe } from 'effect'
import { router } from 'expo-router'
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
import { nonEmptyIndex } from 'src/utils/fp/Optic'

export const newModality = StateRef.execute(
  State.on(root.at('modalityForm')).set(initialModalityForm),
)

export const openModality = (modality: Modality.Reference) =>
  pipe(
    State.with(getModality(modality)),
    Effect.flatMap(Option.fromNullable),
    Effect.flatMap(m =>
      m._tag === 'StaticModality' ? Option.none() : Option.some(m),
    ),
    Effect.tap(m =>
      State.on(root.at('modalityForm')).set({
        id: m.id,
        name: m.name,
        positions: Array.map(m.positions, p => ({
          abbreviation: p.abbreviation.toUpperCase(),
          name: p.name,
          oldAbbreviation: p.abbreviation,
        })),
      }),
    ),
    Effect.tap(() => router.navigate(`/modalities/${modality.id}`)),
    StateRef.execute,
    Effect.ignore,
  )

export const submitModality = pipe(
  State.with(s => s.modalityForm),
  Effect.flatMap(validateModalityForm),
  Effect.flatMap(f =>
    Effect.all({
      _tag: Effect.succeed('CustomModality' as const),
      id: f.id ? Effect.succeed(f.id) : IdGenerator.generate(),
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
        Array.filter(ms, m => m.id !== nextModality.id),
        Array.prepend(nextModality),
      ),
    ),
  ),
  Effect.tap(({ nextModality, prevModality }) =>
    prevModality === null
      ? Effect.void
      : State.on(root.at('groups')).update(
          Record.map(g =>
            g.modality.id === prevModality.id
              ? {
                  ...g,
                  players: Array.map(
                    g.players,
                    adjustPlayerPosition({
                      prevModality,
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
  StateRef.execute,
  Effect.tap(() => router.back()),
  Effect.ignore,
)

export const openRemoveModality = pipe(
  State.with(s => s.modalityForm.id),
  StateRef.execute,
  Effect.tap(id =>
    id === null ? router.back() : router.navigate(`/modalities/${id}/delete`),
  ),
)

export const removeModality = pipe(
  State.with(s => s.modalityForm.id),
  Effect.flatMap(Option.fromNullable),
  Effect.flatMap(id => State.with(getModality({ _tag: 'CustomModality', id }))),
  Effect.flatMap(Option.fromNullable),
  Effect.bindTo('prevModality'),
  Effect.tap(({ prevModality }) =>
    State.on(root.at('customModalities')).update(
      Array.filter(m => m.id !== prevModality.id),
    ),
  ),
  Effect.bind('nextModality', () =>
    State.with(s =>
      Array.head(s.customModalities).pipe(Option.getOrElse(() => soccer)),
    ),
  ),
  Effect.tap(({ nextModality, prevModality }) =>
    State.on(root.at('groups')).update(
      Record.map(g =>
        g.modality.id === prevModality.id
          ? {
              ...g,
              modality:
                nextModality._tag === 'CustomModality'
                  ? { _tag: nextModality._tag, id: nextModality.id }
                  : { _tag: nextModality._tag, id: nextModality.id },
              players: Array.map(
                g.players,
                adjustPlayerPosition({
                  prevModality,
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
  Effect.tap(() => router.back()),
  Effect.tap(() => router.back()),
  StateRef.execute,
  Effect.ignore,
)

export const changeModalityName = flow(
  State.on(root.at('modalityForm').at('name')).set,
  StateRef.execute,
)

export const addModalityPosition = StateRef.execute(
  State.on(root.at('modalityForm').at('positions')).update(
    Array.append(blankPositionForm),
  ),
)

export const removeModalityPosition = (index: number) =>
  StateRef.execute(
    State.on(root.at('modalityForm').at('positions')).update(
      flow(
        Array.remove(index),
        Array.match({
          onEmpty: () => [blankPositionForm],
          onNonEmpty: _ => _,
        }),
      ),
    ),
  )

export const liftModalityPosition = (index: number) =>
  StateRef.execute(
    State.on(root.at('modalityForm').at('positions')).update(as =>
      pipe(
        Array.get(as, index),
        Option.flatMap(a =>
          pipe(Array.remove(as, index), Array.insertAt(index - 1, a)),
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
