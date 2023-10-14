/* eslint-disable functional/no-expression-statements */
/* eslint-disable functional/no-let */
import { Group, Modality } from 'src/datatypes'
import { initialAppState } from 'src/model'
import { IdGenerator, IdGeneratorEnv } from 'src/services/IdGenerator'
import { AppStateRefEnv, StateRef } from 'src/services/StateRef'
import { Id } from 'src/utils/Entity'
import { A, F, O, Option, Ref, S, SubscriptionRef } from 'src/utils/fp'
import { _importGroup } from './group'

const modality0 = S.decodeSync(Modality.Modality)({
  id: 'm0',
  name: 'modality0',
  positions: [
    {
      id: 'po0',
      abbreviation: 'p0',
      name: 'position0',
    },
    {
      id: 'po1',
      abbreviation: 'p1',
      name: 'position1',
    },
    {
      id: 'po2',
      abbreviation: 'p2',
      name: 'position2',
    },
  ],
})

const modality1 = S.decodeSync(Modality.Modality)({
  id: 'm1',
  name: 'modality1',
  positions: [
    {
      id: 'po3',
      abbreviation: 'p0',
      name: 'position3',
    },
    {
      id: 'po4',
      abbreviation: 'p4',
      name: 'position4',
    },
  ],
})

const modality2 = S.decodeSync(Modality.Modality)({
  id: 'm2',
  name: 'modality0',
  positions: [
    {
      id: 'po5',
      abbreviation: 'p0',
      name: 'position5',
    },
    {
      id: 'po6',
      abbreviation: 'p1',
      name: 'position6',
    },
  ],
})

const group0 = S.decodeSync(Group.Group)({
  id: 'g0',
  name: 'group0',
  modalityId: 'm0',
  players: [
    {
      id: 'p0',
      active: true,
      createdAt: 0,
      name: 'player0',
      positionId: 'po0',
      rating: 1,
    },
  ],
})

const group1 = S.decodeSync(Group.Group)({
  id: 'g1',
  name: 'group1',
  modalityId: 'm1',
  players: [
    {
      id: 'p1',
      active: true,
      createdAt: 1,
      name: 'player1',
      positionId: 'po3',
      rating: 3,
    },
    {
      id: 'p2',
      active: false,
      createdAt: 2,
      name: 'player2',
      positionId: 'po4',
      rating: 7,
    },
  ],
})

const group2 = S.decodeSync(Group.Group)({
  id: 'g2',
  name: 'group2',
  modalityId: 'm2',
  players: [
    {
      id: 'p3',
      active: true,
      createdAt: 3,
      name: 'player3',
      positionId: 'po5',
      rating: 3,
    },
    {
      id: 'p4',
      active: false,
      createdAt: 4,
      name: 'player4',
      positionId: 'po6',
      rating: 7,
    },
  ],
})

describe('importGroup state logic', () => {
  test('add group and modality', () => {
    const ref = Ref.unsafeMake({
      ...initialAppState,
      groups: { [group0.id]: group0 },
      modalities: [modality0],
    })
    let currentId = 0
    const idGeneratorSequential: IdGenerator = {
      generate: () => F.sync(() => Id((++currentId).toString())),
    }

    _importGroup({
      group: group1,
      modality: modality1,
    }).pipe(
      StateRef.execute,
      F.provideService(IdGeneratorEnv, idGeneratorSequential),
      F.provideService(AppStateRefEnv, {
        ref,
        subscriptionsRef: SubscriptionRef.make([]).pipe(F.runSync),
      }),
      F.runSync,
    )

    const state = Ref.get(ref).pipe(F.runSync)
    expect(state.groups).toStrictEqual<typeof state.groups>({
      [group0.id]: group0,
      '7': S.decodeSync(Group.Group)({
        id: '7',
        name: 'group1',
        modalityId: '3',
        players: [
          {
            id: '5',
            active: true,
            createdAt: 1,
            name: 'player1',
            positionId: '1',
            rating: 3,
          },
          {
            id: '6',
            active: false,
            createdAt: 2,
            name: 'player2',
            positionId: '2',
            rating: 7,
          },
        ],
      }),
    })
    expect(A.get(state.modalities, 1)).toStrictEqual<Option<Modality>>(
      O.some(
        S.decodeSync(Modality.Modality)({
          id: '3',
          name: 'modality1',
          positions: [
            {
              id: '1',
              abbreviation: 'p0',
              name: 'position3',
            },
            {
              id: '2',
              abbreviation: 'p4',
              name: 'position4',
            },
          ],
        }),
      ),
    )
  })

  test('add group and reuse modality', () => {
    const ref = Ref.unsafeMake({
      ...initialAppState,
      groups: { [group0.id]: group0 },
      modalities: [modality0],
    })
    let currentId = 0
    const idGeneratorSequential: IdGenerator = {
      generate: () => F.sync(() => Id((++currentId).toString())),
    }

    _importGroup({
      group: group2,
      modality: modality2,
    }).pipe(
      StateRef.execute,
      F.provideService(IdGeneratorEnv, idGeneratorSequential),
      F.provideService(AppStateRefEnv, {
        ref,
        subscriptionsRef: SubscriptionRef.make([]).pipe(F.runSync),
      }),
      F.runSync,
    )

    const state = Ref.get(ref).pipe(F.runSync)
    console.log(state.groups)
    expect(state.groups).toStrictEqual<typeof state.groups>({
      [group0.id]: group0,
      '4': S.decodeSync(Group.Group)({
        id: '4',
        name: 'group2',
        modalityId: 'm0',
        players: [
          {
            id: '2',
            active: true,
            createdAt: 3,
            name: 'player3',
            positionId: 'po0',
            rating: 3,
          },
          {
            id: '3',
            active: false,
            createdAt: 4,
            name: 'player4',
            positionId: 'po1',
            rating: 7,
          },
        ],
      }),
    })
    expect(state.modalities).toStrictEqual<Array<Modality>>([modality0])
  })
})
