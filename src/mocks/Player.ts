import { Player } from 'src/datatypes'
import { Abbreviation } from 'src/datatypes/Position'
import { Id } from 'src/utils/Entity'
import { Timestamp } from 'src/utils/datatypes'

export const playersMock: Array<Player> = [
  {
    id: '1' as Id,
    name: 'Matheus',
    rating: 10,
    positionAbbreviation: Abbreviation('m'),
    active: true,
    createdAt: Timestamp.Schema(0),
  },
  {
    id: '2' as Id,
    name: 'Paulo A.',
    rating: 4,
    positionAbbreviation: Abbreviation('a'),
    active: true,
    createdAt: Timestamp.Schema(0),
  },
  {
    id: '3' as Id,
    name: 'Carlos',
    rating: 5,
    positionAbbreviation: Abbreviation('z'),
    active: true,
    createdAt: Timestamp.Schema(0),
  },
  {
    id: '4' as Id,
    name: 'Paulo G.',
    rating: 8,
    positionAbbreviation: Abbreviation('g'),
    active: true,
    createdAt: Timestamp.Schema(0),
  },
  {
    id: '5' as Id,
    name: 'Peter',
    rating: 6,
    positionAbbreviation: Abbreviation('z'),
    active: true,
    createdAt: Timestamp.Schema(0),
  },
  {
    id: '6' as Id,
    name: 'Zeca',
    rating: 3,
    positionAbbreviation: Abbreviation('le'),
    active: true,
    createdAt: Timestamp.Schema(0),
  },
  {
    id: '7' as Id,
    name: 'Moisés',
    rating: 3,
    positionAbbreviation: Abbreviation('ld'),
    active: true,
    createdAt: Timestamp.Schema(0),
  },
  {
    id: '8' as Id,
    name: 'Odilon',
    rating: 9,
    positionAbbreviation: Abbreviation('m'),
    active: true,
    createdAt: Timestamp.Schema(0),
  },
  {
    id: '9' as Id,
    name: 'Paulo S.',
    rating: 10,
    positionAbbreviation: Abbreviation('a'),
    active: true,
    createdAt: Timestamp.Schema(0),
  },
  {
    id: '10' as Id,
    name: 'João',
    rating: 7,
    positionAbbreviation: Abbreviation('m'),
    active: true,
    createdAt: Timestamp.Schema(0),
  },
  {
    id: '11' as Id,
    name: 'Anderson',
    rating: 3,
    positionAbbreviation: Abbreviation('z'),
    active: true,
    createdAt: Timestamp.Schema(0),
  },
  {
    id: '12' as Id,
    name: 'Gilmar',
    rating: 6,
    positionAbbreviation: Abbreviation('ld'),
    active: true,
    createdAt: Timestamp.Schema(0),
  },
  {
    id: '13' as Id,
    name: 'Vagner',
    rating: 8,
    positionAbbreviation: Abbreviation('m'),
    active: true,
    createdAt: Timestamp.Schema(0),
  },
  {
    id: '14' as Id,
    name: 'Douglas',
    rating: 2,
    positionAbbreviation: Abbreviation('ld'),
    active: true,
    createdAt: Timestamp.Schema(0),
  },
  {
    id: '15' as Id,
    name: 'Marlon',
    rating: 4,
    positionAbbreviation: Abbreviation('a'),
    active: true,
    createdAt: Timestamp.Schema(0),
  },
  {
    id: '16' as Id,
    name: 'Marcos',
    rating: 8,
    positionAbbreviation: Abbreviation('m'),
    active: true,
    createdAt: Timestamp.Schema(0),
  },
  {
    id: '17' as Id,
    name: 'Jackson',
    rating: 4,
    positionAbbreviation: Abbreviation('a'),
    active: true,
    createdAt: Timestamp.Schema(0),
  },
  {
    id: '18' as Id,
    name: 'Wagner',
    rating: 7,
    positionAbbreviation: Abbreviation('a'),
    active: true,
    createdAt: Timestamp.Schema(0),
  },
  {
    id: '19' as Id,
    name: 'Moa',
    rating: 5,
    positionAbbreviation: Abbreviation('a'),
    active: true,
    createdAt: Timestamp.Schema(0),
  },
  {
    id: '20' as Id,
    name: 'Neto',
    rating: 5,
    positionAbbreviation: Abbreviation('a'),
    active: true,
    createdAt: Timestamp.Schema(0),
  },
  {
    id: '21' as Id,
    name: 'Lucas',
    rating: 7,
    positionAbbreviation: Abbreviation('z'),
    active: true,
    createdAt: Timestamp.Schema(0),
  },
  {
    id: '22' as Id,
    name: 'Jefferson',
    rating: 3,
    positionAbbreviation: Abbreviation('ld'),
    active: true,
    createdAt: Timestamp.Schema(0),
  },
  {
    id: '23' as Id,
    name: 'Clóvis',
    rating: 7,
    positionAbbreviation: Abbreviation('z'),
    active: true,
    createdAt: Timestamp.Schema(0),
  },
]
