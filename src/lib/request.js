'use strict'
/**
 * API Request
 ******************************/

const logger = require('winston'),
  _ = require('lodash'),
  { TYPE_JSON } = require('../../config')

/**
 * API request validation middleware
 * @param  {Object}  opts Validation options
 * @return {Promise}      Middleware that validates the request
 */
exports.validate = opts => {
  const { json, type, paramsAll, paramsAny } = opts
  return (ctx, next) => {
    let reqBody = ctx.request.body
    // Ensure request is of the right type
    if (json) ctx.assert(ctx.is(TYPE_JSON), 406)
    else if (type) ctx.assert(ctx.is(type), 406)
    // Ensure request has all the required params
    if (paramsAll) {
      ctx.assert(
        paramsAll.every(prop => prop in reqBody) && !_.isEmpty(reqBody),
        400
      )
    }
    // Ensure request has at least one of the allowed params
    if (paramsAny) {
      ctx.assert(
        !Object.keys(reqBody).filter(prop => !paramsAny.includes(prop))
          .length && !_.isEmpty(reqBody),
        400
      )
    }
    // Call route handler middleware
    next()
  }
}
