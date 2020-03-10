'use strict'
/**
 * Error Handler
 ******************************/

const logger = require('winston'),
  response = require('./response'),
  release = require('../../package.json'),
  Sentry = require('@sentry/node'),
  {
    IN_DEV,
    ERRORS,
    SENTRY_DSN
  } = require('../../config')

const MAX_STR_LENGTH = 50
// Enable error reporting via Sentry in Production
if (!IN_DEV) {
  Sentry.init({
    dsn: SENTRY_DSN,
    debug: IN_DEV,
    release: release.version,
    environment: process.env.NODE_ENV
  })
}

// Middleware to handle all downstream errors
exports.handler = async (ctx, next) => {
  const hub = Sentry.getCurrentHub()
  const scope = hub.pushScope()
  // Add request context
  scope.addEventProcessor(async (event) => Sentry.Handlers.parseRequest(event, ctx.req))

  try {
    await next()
  } catch (err) {
    // Add id
    if (ctx.state && ctx.state.user) {
      scope.setUser({id: ctx.state.user.id})
    } else if (ctx.params && ctx.params.id) {
      scope.setExtra('id', ctx.params.id)
    }

    const body = ctx.request.body
    if (body) {
      for (let param in body) {
        let value = body[param]
        // Do not add objects
        if (body.hasOwnProperty(param) && !(value instanceof Object)) {
          // Truncate long strings
          if (value.constructor == String && value.length > MAX_STR_LENGTH) {
            value = value.substr(0, MAX_STR_LENGTH) + '...'
          }
          scope.setExtra(param, value)
        }
      }
    }
    // Use specified error status, fallback to router 500 internal error
    ctx.status = err.status || 500
    // Use specified custom message, fallback to router otherwise
    ctx.body = response.build(true, ERRORS[ctx.status] || err.message)
    // Ignore not found errors
    if (ctx.status == 404) return
    ctx.app.emit('error', err, ctx)
  } finally {
    hub.popScope()
  }
}

exports.handle = (err, level) => {
  // if (IN_DEV) return
  if (level) {
    const scope = Sentry.getCurrentHub().getScope()
    scope.setLevel(level)
  }
  Sentry.captureException(err)
}

exports.handleApp = (err, ctx) => {
  // Log and trigger exports.handle
  console.error(err)
}

exports.handleDb = (ctx, e) => {
  // Handle validation error
  if (e['name'] === 'ValidationError' || e['name'] === 'CastError') ctx.throw(400)
  // Handle duplicate error
  else if (e['code'] === 11000) ctx.throw(409)
  // Let upstream handle it otherwise
  throw e
}