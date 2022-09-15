import { combineReducers } from 'redux'
import hydrated from './hydrated'
import preview from './preview'

export default combineReducers({
  preview,
  hydrated,
})
