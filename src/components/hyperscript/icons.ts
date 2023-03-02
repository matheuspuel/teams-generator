import {
  MaterialCommunityIcons as MaterialCommunityIcons_,
  MaterialIcons as MaterialIcons_,
} from '@expo/vector-icons'
import { makeComponentFromClassWithoutChildren } from './helpers'

export const MaterialIcons =
  makeComponentFromClassWithoutChildren(MaterialIcons_)

export const MaterialCommunityIcons = makeComponentFromClassWithoutChildren(
  MaterialCommunityIcons_,
)
