'use strict'
/**
 * Peer controller
 ******************************/

const logger = require('winston'),
  // redis = require('../lib/redis'),
  response = require('../lib/response'),
  request = require('../lib/request'),
  error = require('../lib/error'),
  Peer = require('../models/peer'),
  {
    TYPE_JSON
  } = require('../../config')


/**
 * POST /peer/connect
 */
exports.connect = async (ctx, next) => {
  // Validate request
  ctx = await request.validate(ctx, { json: true })

  ctx.type = TYPE_JSON
  ctx.status = 201
  ctx.body = response.build(false, 'The peer was created')
}