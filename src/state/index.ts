import { StateMachine } from '@matheuspuel/state-machine'
import { Array, Effect, Fiber, Match, Option, pipe, Record } from 'effect'
import {
  type Group,
  GroupOrder,
  type Modality,
  Player,
  type Rating,
  TeamsGenerator,
} from 'src/datatypes'
import type { GroupOrderType } from 'src/datatypes/GroupOrder'
import {
  type CustomModality,
  soccer,
  staticModalities,
} from 'src/datatypes/Modality'
import { playersRequiredClamp, teamsCountClamp } from 'src/datatypes/Parameters'
import type { Abbreviation } from 'src/datatypes/Position'
import { exportGroup } from 'src/export/group'
import type { TranslationFunction } from 'src/i18n'
import { IdGenerator } from 'src/services/IdGenerator'
import { ShareService } from 'src/services/Share'
import { adjustPlayerPosition } from 'src/slices/groups'
import { Timestamp } from 'src/utils/datatypes'
import type { NonEmptyString } from 'src/utils/datatypes/NonEmptyString'
import type { Id } from 'src/utils/Entity'

export type RootState = typeof appStateMachine.initialState

export const appStateMachine = StateMachine.Struct({
  groups: StateMachine.of<{ [groupId: Id]: Group }>({}).mapActions(actions => ({
    ...actions,
    setItem: (group: Group) => actions.update(Record.set(group.id, group)),
    key: (key: Id) => {
      const get = () => actions.get()[key] ?? null
      const update = (f: (item: Group) => Group) =>
        actions.update(Record.modify(key, f))
      return {
        get,
        update,
        remove: () => actions.update(Record.remove(key)),
        players: {
          toggleAll: () =>
            update(g => {
              const allActive = g.players.every(_ => _.active)
              return {
                ...g,
                players: g.players.map(_ => ({ ..._, active: !allActive })),
              }
            }),
          addItem: (item: Player) =>
            update(g => ({ ...g, players: [...g.players, item] })),
          removeItem: (args: { id: Id }) =>
            update(g => ({
              ...g,
              players: g.players.filter(p => p.id !== args.id),
            })),
          id: (id: Id) => {
            const updatePlayer = (f: (_: Player) => Player) =>
              update(g => ({
                ...g,
                players: g.players.map(a => (a.id === id ? f(a) : a)),
              }))
            return {
              get: () => get()?.players.find(_ => _.id === id) ?? null,
              update: updatePlayer,
              active: {
                toggle: () => updatePlayer(_ => ({ ..._, active: !_.active })),
              },
            }
          },
        },
      }
    },
  })),
  customModalities: StateMachine.of<ReadonlyArray<CustomModality>>([]),
  parameters: StateMachine.Struct({
    teamsCountMethod: StateMachine.of<{
      _tag: 'count' | 'playersRequired'
    }>({ _tag: 'count' }).mapActions(actions => ({
      ...actions,
      toggle: () =>
        actions.update(
          Match.valueTags({
            count: () => ({ _tag: 'playersRequired' as const }),
            playersRequired: () => ({ _tag: 'count' as const }),
          }),
        ),
    })),
    teamsCount: StateMachine.of(2).mapActions(actions => ({
      ...actions,
      increment: () => actions.update(_ => teamsCountClamp(_ + 1)),
      decrement: () => actions.update(_ => teamsCountClamp(_ - 1)),
    })),
    playersRequired: StateMachine.of(11).mapActions(actions => ({
      ...actions,
      increment: () => actions.update(_ => playersRequiredClamp(_ + 1)),
      decrement: () => actions.update(_ => playersRequiredClamp(_ - 1)),
    })),
    position: StateMachine.of(true),
    rating: StateMachine.of(true),
  }).mapActions(actions => ({
    ...actions,
    incrementMethod: () =>
      Match.valueTags(actions.teamsCountMethod.get(), {
        count: () => actions.teamsCount.increment(),
        playersRequired: () => actions.playersRequired.increment(),
      }),
    decrementMethod: () =>
      Match.valueTags(actions.teamsCountMethod.get(), {
        count: () => actions.teamsCount.decrement(),
        playersRequired: () => actions.playersRequired.decrement(),
      }),
  })),
  groupOrder: StateMachine.of(GroupOrder.initial).mapActions(actions => ({
    ...actions,
    select: (option: GroupOrderType) =>
      actions.update(([a, ...as]) =>
        a._tag === option
          ? [{ _tag: a._tag, reverse: !a.reverse }, ...as]
          : [
              { _tag: option, reverse: false },
              a,
              ...as.filter(_ => _._tag !== option),
            ],
      ),
  })),
  preferences: StateMachine.Struct({
    isRatingVisible: StateMachine.of(true),
  }),
  result: StateMachine.of<Fiber.Fiber<Array<Array<Player>>>>(
    Fiber.never,
  ).mapActions(actions => ({
    ...actions,
    interruptGeneration: () => actions.get().pipe(Fiber.interruptFork),
  })),
}).mapActions((actions, { Store }) => {
  const getModality = (modality: Modality.Reference): Modality | null =>
    (modality._tag === 'StaticModality'
      ? staticModalities.find(_ => _.id === modality.id)
      : Store.get().customModalities.find(_ => _.id === modality.id)) ?? null
  const getGroupModality = (args: { group: { id: Id } }) => {
    const group = actions.groups.key(args.group.id).get()
    if (!group) return null
    return getModality(group.modality)
  }
  return {
    ...actions,
    getModality,
    getGroupModality,
    removeModality: (reference: { id: Id }) => {
      const modality = getModality({
        _tag: 'CustomModality',
        id: reference.id,
      })
      if (!modality) return
      if (
        Record.some(
          actions.groups.get(),
          _ =>
            _.modality._tag === 'CustomModality' &&
            _.modality.id === modality.id,
        )
      ) {
        // TODO alert that modality is being used by a group and cannot be deleted
        return
      }
      actions.customModalities.update(Array.filter(_ => _.id !== modality.id))
    },
    saveModality: (data: {
      id: Id | null
      name: string
      positions: ReadonlyArray<{
        oldAbbreviation: Abbreviation | null
        abbreviation: Abbreviation
        name: string
      }>
    }) =>
      Effect.gen(function* () {
        if (
          data.positions.some((a, ai) =>
            data.positions.some(
              (b, bi) => a.abbreviation === b.abbreviation && ai !== bi,
            ),
          )
        ) {
          return yield* Effect.fail('duplicatePositions' as const)
        }
        if (data.id) {
          const modality = {
            ...data,
            _tag: 'CustomModality' as const,
            id: data.id,
          }
          const prevModality = getModality(modality)
          if (!prevModality) return
          actions.customModalities.update(_ => [
            modality,
            ..._.filter(_ => _.id !== modality.id),
          ])
          actions.groups.update(
            Record.map(_ =>
              _.modality.id === prevModality.id
                ? {
                    ..._,
                    players: _.players.map(
                      adjustPlayerPosition({
                        prevModality,
                        nextModality: { _tag: 'edited', modality },
                      }),
                    ),
                  }
                : _,
            ),
          )
        } else {
          const id = yield* IdGenerator.generate()
          actions.customModalities.update(_ => [
            { ...data, _tag: 'CustomModality' as const, id },
            ..._,
          ])
        }
      }),
    savePlayer: (data: {
      id: Id | null
      group: { id: Id }
      name: string
      positionAbbreviation: Abbreviation
      rating: Rating
    }) =>
      Effect.gen(function* () {
        if (data.id) {
          actions.groups
            .key(data.group.id)
            .players.id(data.id)
            .update(_ => ({
              ...data,
              id: _.id,
              active: _.active,
              createdAt: _.createdAt,
            }))
        } else {
          const id = yield* IdGenerator.generate()
          const now = yield* Timestamp.now
          actions.groups.key(data.group.id).players.addItem({
            ...data,
            id,
            active: true,
            createdAt: now,
          })
        }
      }),
    saveGroup: (data: {
      id: Id | null
      name: string
      modality: Modality.Reference
    }) =>
      Effect.gen(function* () {
        if (data.id === null) {
          const id = yield* IdGenerator.generate()
          actions.groups.setItem({
            id,
            name: data.name,
            modality: data.modality,
            players: [],
          })
        } else {
          const prevModality = getGroupModality({ group: { id: data.id } })
          const nextModality = getModality(data.modality)
          if (!nextModality) return
          actions.groups.key(data.id).update(_ => ({
            id: _.id,
            name: data.name,
            modality: data.modality,
            players:
              data.modality.id === _.modality.id
                ? _.players
                : _.players.map(
                    adjustPlayerPosition({
                      prevModality,
                      nextModality: {
                        _tag: 'unchanged',
                        modality: nextModality,
                      },
                    }),
                  ),
          }))
        }
      }),
    exportGroup: (args: { id: Id }) =>
      Effect.gen(function* () {
        const group = actions.groups.key(args.id).get()
        if (!group) return
        const modality = getModality(group.modality)
        if (!modality) return
        yield* exportGroup({ group, modality })
      }),
    importGroupData: (
      data: Omit<Group, 'modality'> & {
        modality:
          { _tag: 'StaticModality'; id: NonEmptyString } | CustomModality
      },
    ) =>
      Effect.gen(function* () {
        if (data.modality._tag === 'StaticModality') {
          const modality =
            staticModalities.find(m => m.id === data.modality.id) ?? soccer
          return {
            modality: { _tag: 'StaticModality' as const, id: modality.id },
            name: data.name,
            players: yield* Effect.forEach(data.players, player =>
              Effect.gen(function* () {
                const id = yield* IdGenerator.generate()
                const positionAbbreviation = (
                  modality.positions.find(
                    _ => _.abbreviation === player.positionAbbreviation,
                  ) ?? modality.positions[0]
                ).abbreviation
                return { ...player, id, positionAbbreviation }
              }),
            ),
          }
        } else {
          const modality = data.modality
          const existingModality = actions.customModalities
            .get()
            .find(
              m =>
                m.name === modality.name &&
                modality.positions.every(a =>
                  m.positions.some(b => a.abbreviation === b.abbreviation),
                ),
            )
          const nextModalityId = existingModality
            ? existingModality.id
            : yield* IdGenerator.generate()
          if (!existingModality) {
            actions.customModalities.update(
              Array.append({
                _tag: 'CustomModality' as const,
                id: nextModalityId,
                name: modality.name,
                positions: modality.positions,
              }),
            )
          }
          return {
            modality: { _tag: 'CustomModality' as const, id: nextModalityId },
            name: data.name,
            players: yield* Effect.forEach(data.players, p =>
              Effect.map(IdGenerator.generate(), id => ({ ...p, id })),
            ),
          }
        }
      }).pipe(
        Effect.flatMap((group: Omit<Group, 'id'>) =>
          pipe(
            IdGenerator.generate(),
            Effect.tap(id => actions.groups.setItem({ ...group, id })),
          ),
        ),
        Effect.asVoid,
      ),
    generateResult: (args: { group: { id: Id } }) =>
      Effect.gen(function* () {
        yield* actions.result.interruptGeneration()
        actions.result.set(Fiber.never)
        yield* Effect.sleep(100)
        const state = Store.get()
        const group = yield* Record.get(state.groups, args.group.id)
        const players = Array.filter(group.players, Player.isActive)
        const modality = yield* Option.fromNullable(getModality(group.modality))
        const parameters = state.parameters
        const resultFiber = yield* TeamsGenerator.generateRandomBalancedTeams({
          players,
          modality,
          criteria: {
            position: parameters.position,
            rating: parameters.rating,
            distribution: pipe(
              parameters.teamsCountMethod,
              Match.valueTags({
                count: () => ({
                  _tag: 'numOfTeams' as const,
                  numOfTeams: parameters.teamsCount,
                }),
                playersRequired: () => ({
                  _tag: 'fixedNumberOfPlayers' as const,
                  fixedNumberOfPlayers: parameters.playersRequired,
                }),
              }),
            ),
          },
        }).pipe(Effect.forkDaemon)
        actions.result.set(resultFiber)
        yield* Effect.gen(function* () {
          yield* resultFiber
          actions.result.set(Fiber.map(resultFiber, _ => _))
        }).pipe(Effect.forkDaemon)
        return resultFiber
      }),
    shareResult: (args: { group: { id: Id } }, t: TranslationFunction) =>
      Effect.gen(function* () {
        const modality = getGroupModality(args)
        if (!modality) return
        const teams = yield* actions.result.get()
        return yield* ShareService.shareMessage({
          message: Player.teamListToStringSensitive({ modality, teams }, t),
          title: t('Teams'),
        })
      }),
  }
})

export const appStateMachineInstance = StateMachine.run(appStateMachine)
