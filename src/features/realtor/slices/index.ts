import { combineReducers } from 'redux'
import realtor from './realtor'
import registration from './registration'

export default combineReducers({
  registration,
  realtor,
})
