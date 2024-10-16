/* eslint-disable functional/no-expression-statements */
/* eslint-disable functional/no-let */
import { Schema } from '@effect/schema'
import { Effect, Ref, SubscriptionRef } from 'effect'
import { Group, Modality } from 'src/datatypes'
import { CustomModality, futsal, futsalPositions } from 'src/datatypes/Modality'
import { RootState, initialAppState } from 'src/model'
import { IdGenerator } from 'src/services/IdGenerator'
import { AppStateRef, StateRef, Subscription } from 'src/services/StateRef'
import { Id } from 'src/utils/Entity'
import { describe, expect, test } from 'vitest'
import { _importGroup } from './group'

const modality0 = Schema.decodeSync(Modality.CustomModality)({
  _tag: 'CustomModality',
  id: 'm0',
  name: 'modality0',
  positions: [
    {
      abbreviation: 'p0',
      name: 'position0',
    },
    {
      abbreviation: 'p1',
      name: 'position1',
    },
    {
      abbreviation: 'p2',
      name: 'position2',
    },
  ],
})

const modality1 = Schema.decodeSync(Modality.CustomModality)({
  _tag: 'CustomModality',
  id: 'm1',
  name: 'modality1',
  positions: [
    {
      abbreviation: 'p0',
      name: 'position3',
    },
    {
      abbreviation: 'p4',
      name: 'position4',
    },
  ],
})

const modality2 = Schema.decodeSync(Modality.CustomModality)({
  _tag: 'CustomModality',
  id: 'm2',
  name: 'modality0',
  positions: [
    {
      abbreviation: 'p0',
      name: 'position5',
    },
    {
      abbreviation: 'p1',
      name: 'position6',
    },
  ],
})

const group0 = Schema.decodeSync(Group.Group)({
  id: 'g0',
  name: 'group0',
  modality: { _tag: 'StaticModality', id: 'm0' },
  players: [
    {
      id: 'p0',
      active: true,
      createdAt: 0,
      name: 'player0',
      positionAbbreviation: 'po0',
      rating: 1,
    },
  ],
})

const group1 = Schema.decodeSync(Group.Group)({
  id: 'g1',
  name: 'group1',
  modality: { _tag: 'CustomModality', id: 'm1' },
  players: [
    {
      id: 'p1',
      active: true,
      createdAt: 1,
      name: 'player1',
      positionAbbreviation: 'po3',
      rating: 3,
    },
    {
      id: 'p2',
      active: false,
      createdAt: 2,
      name: 'player2',
      positionAbbreviation: 'po4',
      rating: 7,
    },
  ],
})

const group2 = Schema.decodeSync(Group.Group)({
  id: 'g2',
  name: 'group2',
  modality: { _tag: 'CustomModality', id: 'm2' },
  players: [
    {
      id: 'p3',
      active: true,
      createdAt: 3,
      name: 'player3',
      positionAbbreviation: 'po5',
      rating: 3,
    },
    {
      id: 'p4',
      active: false,
      createdAt: 4,
      name: 'player4',
      positionAbbreviation: 'po6',
      rating: 7,
    },
  ],
})

const group3 = Schema.decodeSync(Group.Group)({
  id: 'g3',
  name: 'group3',
  modality: { _tag: 'StaticModality', id: futsal.id },
  players: [
    {
      id: 'p5',
      active: true,
      createdAt: 5,
      name: 'player5',
      positionAbbreviation: futsalPositions.f.abbreviation,
      rating: 5,
    },
    {
      id: 'p6',
      active: false,
      createdAt: 6,
      name: 'player6',
      positionAbbreviation: futsalPositions.ad.abbreviation,
      rating: 6,
    },
  ],
})

describe('importGroup state logic', () => {
  test('add group and modality', () => {
    const ref = Ref.unsafeMake<RootState>({
      ...initialAppState,
      groups: { [group0.id]: group0 },
      customModalities: [modality0],
    })
    let currentId = 0
    const IdGeneratorSequential = IdGenerator.context({
      _tag: 'IdGenerator',
      generate: () => Effect.sync(() => Id.make((++currentId).toString())),
    })

    _importGroup({
      ...group1,
      modality: modality1,
    }).pipe(
      StateRef.execute,
      Effect.provide(IdGeneratorSequential),
      Effect.provideService(AppStateRef, {
        ref,
        subscriptionsRef: SubscriptionRef.make<ReadonlyArray<Subscription>>(
          [],
        ).pipe(Effect.runSync),
      }),
      Effect.runSync,
    )

    const state = Ref.get(ref).pipe(Effect.runSync)
    expect(state.groups).toEqual<typeof state.groups>({
      [group0.id]: group0,
      [Id.make('4')]: Schema.decodeSync(Group.Group)({
        id: '4',
        name: 'group1',
        modality: { _tag: 'CustomModality', id: '1' },
        players: [
          {
            id: '2',
            active: true,
            createdAt: 1,
            name: 'player1',
            positionAbbreviation: 'po3',
            rating: 3,
          },
          {
            id: '3',
            active: false,
            createdAt: 2,
            name: 'player2',
            positionAbbreviation: 'po4',
            rating: 7,
          },
        ],
      }),
    })
    expect(state.customModalities).toEqual<ReadonlyArray<CustomModality>>([
      modality0,
      Schema.decodeSync(Modality.CustomModality)({
        _tag: 'CustomModality',
        id: '1',
        name: 'modality1',
        positions: [
          {
            abbreviation: 'p0',
            name: 'position3',
          },
          {
            abbreviation: 'p4',
            name: 'position4',
          },
        ],
      }),
    ])
  })

  test('add group and reuse modality', () => {
    const ref = Ref.unsafeMake<RootState>({
      ...initialAppState,
      groups: { [group0.id]: group0 },
      customModalities: [modality0],
    })
    let currentId = 0
    const IdGeneratorSequential = IdGenerator.context({
      _tag: 'IdGenerator',
      generate: () => Effect.sync(() => Id.make((++currentId).toString())),
    })

    _importGroup({
      ...group2,
      modality: modality2,
    }).pipe(
      StateRef.execute,
      Effect.provide(IdGeneratorSequential),
      Effect.provideService(AppStateRef, {
        ref,
        subscriptionsRef: SubscriptionRef.make<ReadonlyArray<Subscription>>(
          [],
        ).pipe(Effect.runSync),
      }),
      Effect.runSync,
    )

    const state = Ref.get(ref).pipe(Effect.runSync)
    expect(state.groups).toEqual<typeof state.groups>({
      [group0.id]: group0,
      [Id.make('3')]: Schema.decodeSync(Group.Group)({
        id: '3',
        name: 'group2',
        modality: { _tag: 'CustomModality', id: 'm0' },
        players: [
          {
            id: '1',
            active: true,
            createdAt: 3,
            name: 'player3',
            positionAbbreviation: 'po5',
            rating: 3,
          },
          {
            id: '2',
            active: false,
            createdAt: 4,
            name: 'player4',
            positionAbbreviation: 'po6',
            rating: 7,
          },
        ],
      }),
    })
    expect(state.customModalities).toStrictEqual<Array<CustomModality>>([
      modality0,
    ])
  })

  test('add group with static modality', () => {
    const ref = Ref.unsafeMake<RootState>({
      ...initialAppState,
      groups: { [group0.id]: group0 },
      customModalities: [modality0],
    })
    let currentId = 0
    const IdGeneratorSequential = IdGenerator.context({
      _tag: 'IdGenerator',
      generate: () => Effect.sync(() => Id.make((++currentId).toString())),
    })
    // TODO reuse IdGeneratorTest

    _importGroup({
      ...group3,
      modality: { _tag: 'StaticModality', id: futsal.id },
    }).pipe(
      StateRef.execute,
      Effect.provide(IdGeneratorSequential),
      Effect.provideService(AppStateRef, {
        ref,
        subscriptionsRef: SubscriptionRef.make<ReadonlyArray<Subscription>>(
          [],
        ).pipe(Effect.runSync),
      }),
      Effect.runSync,
    )

    const state = Ref.get(ref).pipe(Effect.runSync)
    expect(state.groups).toEqual<typeof state.groups>({
      [group0.id]: group0,
      [Id.make('3')]: Schema.decodeSync(Group.Group)({
        id: '3',
        name: 'group3',
        modality: { _tag: 'StaticModality', id: futsal.id },
        players: [
          {
            id: '1',
            active: true,
            createdAt: 5,
            name: 'player5',
            positionAbbreviation: futsalPositions.f.abbreviation,
            rating: 5,
          },
          {
            id: '2',
            active: false,
            createdAt: 6,
            name: 'player6',
            positionAbbreviation: futsalPositions.ad.abbreviation,
            rating: 6,
          },
        ],
      }),
    })
    expect(state.customModalities).toStrictEqual<Array<CustomModality>>([
      modality0,
    ])
  })
})
