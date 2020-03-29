'use strict'
/**
 * API Response
 ******************************/

/**
 * Creates the standard API response
 * @param  {Boolean} isErr   Whether an error occured
 * @param  {String}  message Status message
 * @param  {Object || Array}  data   The requested data where applicable
 * @return {Object}          Standard response
 */
function build (isErr, message, data) {
  let res = {
    status: {
      error: isErr,
      message: message
    }
  }
  if (data) res.data = data
  return res
}

/**
 * Creates the standard API error response
 * @param  {Number} code   The error code
 * @return {Object}          Standard error response
 */
exports.error = function (code, ...args) {
  let res = build(true, ...args)
  res.status.code = code
  return res
}

/**
 * Creates the standard API success response
 * @return {Object}          Standard success response
 */
exports.success = function (...args) {
  return build(false, ...args)
}
