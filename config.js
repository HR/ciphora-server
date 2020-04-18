'use strict'
/**
 * App-wide config
 ******************************/

const ENV_DEV = 'development'
const ENV = process.env.NODE_ENV || ENV_DEV

module.exports = {
  ENV,
  IN_DEV: ENV === ENV_DEV,
  PORT: process.env.PORT || '7000',
  SIGNATURE_EXPIRE_TIME: 60 * 1000 // 1 minute
}
