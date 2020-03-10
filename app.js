'use strict'
/**
 * app.js
 * Entry point for server
 ******************************/

const http = require('http'),
  koa = require('koa'),
  koaLogger = require('koa-logger'),
  koaRouter = require('@koa/router'),
  koaBody = require('koa-body'),
  koaCors = require('@koa/cors'),
  helmet = require('koa-helmet'),
  Graceful = require('@ladjs/graceful'),{ hostname } = require('os'),
  logger = require('./src/lib/logger'), // Init logger to override console
  error = require('./src/lib/error'),
  SignalServer = require('./src/lib/sserver'),
  // redisClient = require('./src/lib/redis'),
  // mongoose = require('./src/lib/db'),
  peer = require('./src/api/peer'),
  release = require('./package.json'),
  WebSocket = require('ws'),
  {API_VERSION, ENV, IN_DEV, PORT} = require('./config')

/**
 * Init
 **/

const app = new koa()
// Default router
const router = new koaRouter()
// API router
const api = new koaRouter({
  prefix: `/${API_VERSION}`
})
let server = http.createServer(app.callback())
const ss = new SignalServer({ server })

ss.on('error', (err) => app.emit('error', err))

/**
 * Config
 **/

// Add some security via HTTP headers
// app.use(helmet())

if (IN_DEV) {
  // Dev
  // Enable CORS from any origin in dev mode
  app.use(koaCors({ origin: '*' }))
} else {
  // Production
  // Restrictive CORS
  app.use(koaCors())
}

// Parse request body (JSON, multipart,...)
app.use(koaBody({ multipart: true }))

// Koa request logging
app.use(koaLogger(console.info))

// Error handler
app.use(error.handler)

// Catch errors
app.on('error', error.handleApp)

/**
 * Routes
 **/

// Users
// api.get('/:id/referral', users.referral)

// Home
router.get('/', async (ctx, next) => ctx.body = 'https://github.com/HR/ciphora')
// Gotta catch em all
router.all('/*', async (ctx, next) => ctx.throw(404))

/**
 * Start server
 **/

// Setup routes
app
  .use(api.routes())
  .use(api.allowedMethods())
  .use(router.routes())
  .use(router.allowedMethods())

// Start server
server = server.listen(PORT, () => {
  console.info(`Started for Ciphora Server ${API_VERSION} (${release.version}) - ${ENV}`)
  console.info(`Running at http://${hostname()}:${PORT}`)
})

// Gracefully shutdown
const graceful = new Graceful({
  // uses `server.close` for graceful exit
  server,
  // uses `redisClient.quit` for graceful exit
  // redisClient,
  // uses `mongoose.disconnect` for graceful exit
  // mongoose,
  // default logger
  logger: console,
  // max time allowed in ms for graceful exit
  timeoutMs: 5000
})

graceful.listen()
