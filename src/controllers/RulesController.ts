import * as fs from 'fs'
import * as Yup from 'yup'
import { Request, Response } from 'express'
import { RulesInterface } from '../interfaces/Rules'

class RulesController {
  public async index (req: Request, res: Response): Promise<Response> {
    const rawdata = fs.readFileSync('src/database/availability-rules.json')

    const rules = JSON.parse(rawdata.toString())

    return res.json(rules)
  }

  public async store (req: Request, res: Response): Promise<Response> {
    // Validates user request
    const schema = Yup.object().shape({
      periodicity: Yup.string().oneOf(['daily', 'weekly', 'unique']).required(),
      intervals: Yup.object().shape({
        start: Yup.string().required(),
        end: Yup.string().required()
      }).required(),
      date: Yup.date().when('periodicity', {
        is: 'unique',
        then: Yup.date().required()
      }),
      days: Yup.array().when('periodicity', {
        is: 'weekly',
        then: Yup.array().required()
      })
    })

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: '400 - Bad Request' })
    }

    const { periodicity, intervals, date, days } = req.body

    const rule: RulesInterface = {
      periodicity: periodicity,
      intervals: intervals,
      date: date,
      days: days
    }

    // Check if given interval conflicts with another interval
    const rawdata = fs.readFileSync('src/database/availability-rules.json')

    const rules = JSON.parse(rawdata.toString())

    for (const index in rules) {
      const startHourDatabaseArray = rules[index].intervals.start.split(':')
      const startHourDatabase = parseFloat(startHourDatabaseArray[0] + '.' + startHourDatabaseArray[1])

      const endHourDatabaseArray = rules[index].intervals.end.split(':')
      const endHourDatabase = parseFloat(endHourDatabaseArray[0] + '.' + endHourDatabaseArray[1])

      const startHourBodyArray = intervals.start.split(':')
      const startHourBody = parseFloat(startHourBodyArray[0] + '.' + startHourBodyArray[1])

      const endHourBodyArray = intervals.end.split(':')
      const endHourBody = parseFloat(endHourBodyArray[0] + '.' + endHourBodyArray[1])

      if ((startHourDatabase <= endHourBody && endHourDatabase >= endHourBody) ||
          (startHourDatabase <= startHourBody && endHourDatabase >= endHourBody) ||
          (startHourBody <= endHourDatabase && endHourDatabase <= endHourBody)) {
        return res.status(409).json({ error: '409 - Conflict - Given interval conflicts with another interval already created' })
      }
    }

    const indexArray = Object.keys(rules)
    const lastIndex = Object.keys(rules).length === 0 ? 0 : indexArray[indexArray.length - 1]

    // Creates register in database (.json file)
    rules[+lastIndex + 1] = rule

    const data = JSON.stringify(rules)
    fs.writeFileSync('src/database/availability-rules.json', data)

    return res.json(rule)
  }

  public async delete (req: Request, res: Response): Promise<Response> {
    const id = req.params.id

    const rawdata = fs.readFileSync('src/database/availability-rules.json')

    const rules = JSON.parse(rawdata.toString())

    // Check if rule id exists
    if (!rules[id]) {
      return res.status(404).json({ error: '404 - Not Found - Rule id not found' })
    }

    delete rules[id]

    const data = JSON.stringify(rules)
    fs.writeFileSync('src/database/availability-rules.json', data)

    return res.json(rules)
  }
}

export default new RulesController()
