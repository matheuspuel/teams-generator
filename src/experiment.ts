import { $, A, IO, Rec, Tup } from 'fp'
import * as Id from 'fp-ts/Identity'
import { generateRandomBalancedTeams } from './business/distribution'
import { Player, PlayerListShow } from './datatypes/Player'
import { PositionDict } from './datatypes/Position'
import { playersMock } from './mocks/Player'

const teams = generateRandomBalancedTeams({ position: true, rating: true })(3)(
  playersMock,
)()

const showTeams = (teams: Array<Array<Player>>) =>
  $(
    teams,
    A.map(t => ({
      players: t,
      count: t.length,
      total: t.reduce((acc, p) => acc + p.rating, 0),
      positionCount: t.reduce(
        (acc, cur) => ({ ...acc, [cur.position]: acc[cur.position] + 1 }),
        $(
          PositionDict,
          Rec.map((): number => 0),
        ),
      ),
    })),
    A.map(t =>
      $(
        t.players,
        PlayerListShow.show,
        Id.bindTo('players'),
        Id.bind(
          'totals',
          () =>
            `Count: ${t.count}\nTotal: ${t.total}\nAverage: ${
              t.total / t.count
            }\n`,
        ),
        Id.bind('positions', () =>
          $(
            t.positionCount,
            Rec.mapWithIndex((k, v) => `${k}: ${v}`),
            Rec.toEntries,
            A.map(Tup.snd),
            v => v.join('\n'),
          ),
        ),
        ({ players, positions, totals }) =>
          `${players}\n${positions}\n${totals}`,
      ),
    ),
    v => v.join('\n\n'),
  )

const text = showTeams(teams)

const showResult: IO<void> = () => console.log(text)

// eslint-disable-next-line functional/no-expression-statement
showResult()
