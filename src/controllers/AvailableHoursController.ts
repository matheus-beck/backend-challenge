import * as fs from 'fs'
import { Request, Response } from 'express'
import {
  isWithinInterval,
  getDay,
  parseISO,
  differenceInCalendarDays,
  addDays,
  format
} from 'date-fns'

class AvailableHoursController {
  public async index (req: Request, res: Response): Promise<Response> {
    const availableHours = []

    const { startDate } = req.body
    const { endDate } = req.body
    const totalDays = differenceInCalendarDays(parseISO(endDate), parseISO(startDate))

    const rawdata = fs.readFileSync('src/database/availability-rules.json')

    const rules = JSON.parse(rawdata.toString())

    for (const index in rules) {
      const startHour = rules[index].intervals.start
      const endHour = rules[index].intervals.end
      let availableDate, daysOfWeek, dateExists

      switch (rules[index].periodicity) {
        case 'daily':
          availableDate = parseISO(startDate)

          for (let i = 0; i <= totalDays; i++) {
            let dateExists = false

            // Check if Date is already at availableHours
            availableHours.forEach(rule => {
              if (rule.day === format(availableDate, 'dd-MM-yyyy')) {
                rule.intervals.push({
                  start: startHour,
                  end: endHour
                })
                dateExists = true
              }
            })

            // Date is not at avaiableHours yet
            if (dateExists === false) {
              const availableDay = {
                day: format(availableDate, 'dd-MM-yyyy'),
                intervals: []
              }

              availableDay.intervals.push({
                start: startHour,
                end: endHour
              })

              availableHours.push(availableDay)
            }
            availableDate = addDays(availableDate, 1)
          }
          break
        case 'weekly':
          availableDate = parseISO(startDate)
          daysOfWeek = rules[index].days
          dateExists = false

          // Check if Date is already at availableHours
          availableHours.forEach(rule => {
            const dateArray = rule.day.split('-')
            const date = new Date(dateArray[2], dateArray[1] - 1, dateArray[0])

            if (daysOfWeek.includes(getDay(date))) {
              rule.intervals.push({
                start: startHour,
                end: endHour
              })
              dateExists = true
            }
          })

          // Date is not at avaiableHours yet
          if (dateExists === false && daysOfWeek.includes(getDay(availableDate))) {
            const availableDay = {
              day: format(availableDate, 'dd-MM-yyyy'),
              intervals: []
            }

            availableDay.intervals.push({
              start: startHour,
              end: endHour
            })

            availableHours.push(availableDay)
          }
          availableDate = addDays(availableDate, 1)

          break
        case 'unique':
          // Check if Date is in the chosen interval
          if (isWithinInterval(parseISO(rules[index].date), {
            start: parseISO(startDate),
            end: parseISO(endDate)
          })) {
            let dateExists = false

            // Check if Date is already at availableHours
            availableHours.forEach(el => {
              if (el.day === format(parseISO(rules[index].date), 'dd-MM-yyyy')) {
                el.intervals.push({
                  start: startHour,
                  end: endHour
                })
                dateExists = true
              }
            })

            // Date is not at avaiableHours yet
            if (dateExists === false) {
              const availableDay = {
                day: format(parseISO(rules[index].date), 'dd-MM-yyyy'),
                intervals: []
              }

              availableDay.intervals.push({
                start: startHour,
                end: endHour
              })

              availableHours.push(availableDay)
            }
          }
          break
        default:
          console.log('Error, periodicity not found')
          break
      }
    }
    return res.json(availableHours)
  }
}
export default new AvailableHoursController()
