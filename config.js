'use strict'
/**
 * App-wide config
 ******************************/

const ENV_DEV = 'development'
const ENV = process.env.NODE_ENV || ENV_DEV

module.exports = {
  API_VERSION: 'v1',
  ENV,
  IN_DEV: ENV === ENV_DEV,
  PORT: process.env.PORT || '7000',
  REDIS_URI: process.env.REDIS_URI,
  TYPE_JSON: 'application/json',
  ERRORS: {
    400: 'Incorrect or missing params',
    404: '404 Wubba Lubba Dub Dub!',
    406: 'Request must be of JSON format',
    500: 'An unexpected error occured ¯_(ツ)_/¯'
  }
}
