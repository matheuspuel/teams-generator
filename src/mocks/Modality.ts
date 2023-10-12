import { Modality } from 'src/datatypes'
import { Abbreviation } from 'src/datatypes/Position'
import { Id } from 'src/utils/Entity'
import { NonEmptyString } from 'src/utils/datatypes/NonEmptyString'

export const soccerMock: Modality = {
  id: Id('1'),
  name: NonEmptyString('Futebol'),
  positions: [
    {
      id: Id('G'),
      abbreviation: Abbreviation('g'),
      name: NonEmptyString('Goleiro'),
    },
    {
      id: Id('Z'),
      abbreviation: Abbreviation('z'),
      name: NonEmptyString('Zagueiro'),
    },
    {
      id: Id('LE'),
      abbreviation: Abbreviation('le'),
      name: NonEmptyString('Lateral Esquerdo'),
    },
    {
      id: Id('LD'),
      abbreviation: Abbreviation('ld'),
      name: NonEmptyString('Lateral Direito'),
    },
    {
      id: Id('V'),
      abbreviation: Abbreviation('v'),
      name: NonEmptyString('Volante'),
    },
    {
      id: Id('M'),
      abbreviation: Abbreviation('m'),
      name: NonEmptyString('Meia'),
    },
    {
      id: Id('A'),
      abbreviation: Abbreviation('a'),
      name: NonEmptyString('Atacante'),
    },
  ],
}
