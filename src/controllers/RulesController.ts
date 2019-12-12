import * as fs from 'fs'
import * as Yup from 'yup'
import { Request, Response } from 'express'
import { RulesInterface } from '../interfaces/Rules'

class RulesController {
  public async index (req: Request, res: Response): Promise<Response> {
    const rules = JSON.parse(fs.readFileSync('src/database/availability-rules.json').toString())

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
    const rules = JSON.parse(fs.readFileSync('src/database/availability-rules.json').toString())

    for (const index in rules) {
      const startHourDatabase = parseFloat(
        rules[index].intervals.start.split(':')[0] + '.' + rules[index].intervals.start.split(':')[1]
      )

      const endHourDatabase = parseFloat(
        rules[index].intervals.end.split(':')[0] + '.' + rules[index].intervals.end.split(':')[1]
      )

      const startHourBody = parseFloat(
        intervals.start.split(':')[0] + '.' + intervals.start.split(':')[1]
      )

      const endHourBody = parseFloat(
        intervals.end.split(':')[0] + '.' + intervals.end.split(':')[1]
      )

      if ((startHourDatabase <= endHourBody && endHourDatabase >= endHourBody) ||
          (startHourDatabase <= startHourBody && endHourDatabase >= endHourBody) ||
          (startHourBody <= endHourDatabase && endHourDatabase <= endHourBody)) {
        return res.status(409).json({
          error: '409 - Conflict - Given interval conflicts with another interval already created'
        })
      }
    }

    const lastIndex = Object.keys(rules).length === 0 ? 0 : Object.keys(rules)[Object.keys(rules).length - 1]

    // Creates register in database (.json file)
    rules[+lastIndex + 1] = rule

    fs.writeFileSync('src/database/availability-rules.json', JSON.stringify(rules))

    return res.json(rule)
  }

  public async delete (req: Request, res: Response): Promise<Response> {
    const id = req.params.id

    const rules = JSON.parse(fs.readFileSync('src/database/availability-rules.json').toString())

    // Check if rule id exists
    if (!rules[id]) {
      return res.status(404).json({ error: '404 - Not Found - Rule id not found' })
    }

    delete rules[id]

    fs.writeFileSync('src/database/availability-rules.json', JSON.stringify(rules))

    return res.json(rules)
  }
}

export default new RulesController()
