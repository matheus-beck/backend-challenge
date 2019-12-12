import { Router } from 'express'
import RulesController from './controllers/RulesController'
import AvailableHoursController from './controllers/AvailableHoursController'

const routes = Router()

routes.get('/rules', RulesController.index)
routes.post('/rules', RulesController.store)
routes.delete('/rules/:id', RulesController.delete)

routes.get('/available-hours', AvailableHoursController.index)

export default routes
