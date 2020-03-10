'use strict'
/**
 * API Request
 ******************************/

const logger = require('winston'),
  _ = require('lodash'),
  { TYPE_JSON } = require('../../config')

/**
 * Validates the API request
 * @param  {Object}  ctx  Koa request
 * @param  {Object}  opts Validation options
 * @return {Promise}      Resolves if request valid (according to the options)
 */
exports.validate = async (ctx, opts) => {
  let { json, type, paramsAll, paramsAny, auth } = opts
  let reqBody = ctx.request.body
  // Ensure request is of the right type
  if (json) ctx.assert(ctx.is(TYPE_JSON), 406)
  else if (type) ctx.assert(ctx.is(type), 406)
  // Ensure it has all the required params
  if (paramsAll) ctx.assert(paramsAll.every(prop => prop in reqBody) && !_.isEmpty(reqBody), 400)
  // Ensure it had at least one of the allowed params
  if (paramsAny) ctx.assert(!Object.keys(reqBody)
    .filter(prop => !paramsAny.includes(prop))
    .length && !_.isEmpty(reqBody), 400)

  // Return the updated context
  return ctx
}