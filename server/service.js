'use strict';

const express = require('express');
const service = express();
const request = require('superagent');
const moment = require('moment');
const env = require('node-env-file');

try {
  env(__dirname, '../config/' + process.env.NODE_ENV + '.env');
} catch (e) {
  
}

service.get('/service/:location', (req, res, next) => {

  request.get('https://maps.googleapis.com/maps/api/geocode/json?address=' + req.params.location + `&key=${process.env.GEOCODE_KEY}`, (err, response) => {
    if (err) {
      console.log(err);
      return res.sendStatus(500)
    }

    const location = response.body.results[0].geometry.location;
    const timestamp = +moment().format('X');

    request.get('https://maps.googleapis.com/maps/api/timezone/json?location=' + location.lat + ',' + location.lng + '&timestamp=' + timestamp + `&key=${process.env.TIME_KEY}`, (err, response) => {
      if (err) {
        console.log(err);
        return res.sendStatus(500)
      }

      const result = response.body;
      const timeString = moment.unix(timestamp + result.dstOffset + result.rawOffset).utc().format('dddd, MMMM Do YYYY, h:mm:ss a');

      res.json({result: timeString});
    });
  });
});

module.exports = service;