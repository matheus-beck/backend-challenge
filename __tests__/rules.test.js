/* eslint-disable semi */
/* eslint-disable no-undef */
import * as fs from 'fs';
import app from '../src/app';
import request from 'supertest';

describe('Rules', () => {
  it('should be able to create daily rule', async () => {
    const response = await request(app)
      .post('/rules')
      .send({
        periodicity: 'daily',
        intervals: {
          start: '13:00',
          end: '14:00'
        }
      });

    const rawdata = fs.readFileSync('src/database/availability-rules.json');

    const rules = JSON.parse(rawdata.toString());

    const indexArray = Object.keys(rules);
    const lastIndex =
      Object.keys(rules).length === 0 ? 0 : indexArray[indexArray.length - 1];

    expect(response.body).toMatchObject(rules[lastIndex]);
  });

  it('should be able to create rule in an specific date', async () => {
    const response = await request(app)
      .post('/rules')
      .send({
        periodicity: 'unique',
        date: '2019-12-08T21:00:00-03:00',
        intervals: {
          start: '04:00',
          end: '05:00'
        }
      });

    const rawdata = fs.readFileSync('src/database/availability-rules.json');

    const rules = JSON.parse(rawdata.toString());

    const indexArray = Object.keys(rules);
    const lastIndex =
      Object.keys(rules).length === 0 ? 0 : indexArray[indexArray.length - 1];

    expect(response.body).toMatchObject(rules[lastIndex]);
  });

  it('should not allow requests missing parameters', async () => {
    const response = await request(app)
      .post('/rules')
      .send({
        periodicity: 'unique',
        intervals: {
          start: '15:00',
          end: '16:00'
        }
      });

    expect(response.body.error).toBe('400 - Bad Request');
  });

  it('should not allow time conflicts', async () => {
    const response = await request(app)
      .post('/rules')
      .send({
        periodicity: 'unique',
        date: '2019-12-08T21:00:00-03:00',
        intervals: {
          start: '4:30',
          end: '04:50'
        }
      });

    expect(response.body.error).toBe(
      '409 - Conflict - Given interval conflicts with another interval already created'
    );
  });

  it('should be able to create weekly rule', async () => {
    const response = await request(app)
      .post('/rules')
      .send({
        periodicity: 'weekly',
        intervals: {
          start: '05:30',
          end: '06:30'
        },
        days: [1, 3, 5]
      });

    const rawdata = fs.readFileSync('src/database/availability-rules.json');

    const rules = JSON.parse(rawdata.toString());

    const indexArray = Object.keys(rules);
    const lastIndex =
      Object.keys(rules).length === 0 ? 0 : indexArray[indexArray.length - 1];

    expect(response.body).toMatchObject(rules[lastIndex]);
  });

  it('should not allow deletion of inexistent rule', async () => {
    const response = await request(app)
      .delete('/rules/-1')
      .send();

    expect(response.body.error).toBe('404 - Not Found - Rule id not found');
  });

  it('should allow deletion of rule', async () => {
    const response = await request(app)
      .delete('/rules/2')
      .send();

    const rawdata = await fs.readFileSync(
      'src/database/availability-rules.json'
    );

    const rules = JSON.parse(rawdata.toString());

    expect(response.body).toStrictEqual(rules);
  });

  it('should be able to create rule in an specific date', async () => {
    const response = await request(app)
      .post('/rules')
      .send({
        periodicity: 'unique',
        date: '2019-12-08T21:00:00-03:00',
        intervals: {
          start: '04:00',
          end: '05:00'
        }
      });

    const rawdata = fs.readFileSync('src/database/availability-rules.json');

    const rules = JSON.parse(rawdata.toString());

    const indexArray = Object.keys(rules);
    const lastIndex =
      Object.keys(rules).length === 0 ? 0 : indexArray[indexArray.length - 1];

    expect(response.body).toMatchObject(rules[lastIndex]);
  });

  it('should be able to fetch rules from availability-rules.json', async () => {
    const response = await request(app)
      .get('/rules')
      .send();

    const rawdata = fs.readFileSync('src/database/availability-rules.json');

    const rules = JSON.parse(rawdata.toString());

    expect(response.body).toMatchObject(rules);
  });
});
