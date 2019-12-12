/* eslint-disable semi */
/* eslint-disable no-undef */
import * as fs from 'fs';
import app from '../src/app';
import request from 'supertest';

describe('AvailableHours', () => {
  it('should return a list of available hours based on given interval', async () => {
    const response = await request(app)
      .get('/available-hours')
      .send({
        startDate: '2019-12-05T12:00:00-03:00',
        endDate: '2019-12-15T20:00:00-03:00'
      });

    expect(response.body).toBeInstanceOf(Array);
  });
});
