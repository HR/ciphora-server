'use strict'
/**
 * Redis (connector)
 ******************************/

const logger = require('winston'),
  Redis = require('ioredis'),
  { REDIS_URI } = require('../../config')

const redis = new Redis(REDIS_URI)

// When successfully connected
redis.on('ready', function (err) {
  console.info("Redis default connection opened ✅")
})

// If the connection throws an error
redis.on('error', function (err) {
  console.error(err)
})

// When the connection is disconnected
redis.on('close', function () {
  console.info('Redis default connection disconnected')
})

module.exports = redis