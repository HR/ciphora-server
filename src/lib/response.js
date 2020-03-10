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
exports.build = function (isErr, message, data) {
  let res = {
    status: {
      error: isErr,
      message: message
    }
  }
  if (data) res['data'] = data
  return res
}