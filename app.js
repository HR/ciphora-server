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
  Graceful = require('@ladjs/graceful'),
  { hostname } = require('os'),
  logger = require('./src/lib/logger'), // Init logger to override console
  error = require('./src/lib/error'),
  SignalServer = require('./src/lib/signalserver'),
  // redisClient = require('./src/lib/db'),
  release = require('./package.json'),
  { API_VERSION, ENV, PORT } = require('./config')

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
const ss = new SignalServer(server)
ss.on('error', err => app.emit('error', err))

/**
 * Config
 **/

// Parse request body (JSON)
app.use(koaBody())

// Koa request logging
app.use(koaLogger(console.info))

// Error handler
app.use(error.handler)

// Catch errors
app.on('error', error.handleApp)

/**
 * Routes
 **/

// Home
router.get(
  '/',
  async (ctx, next) => (ctx.body = 'https://github.com/HR/ciphora')
)
// Gotta catch em all
router.all('/*', async (ctx, next) => {
  // ignore favicon
  if (ctx.path === '/favicon.ico') return
  ctx.throw(404)
})

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
  console.info(
    `Started for Ciphora Server ${API_VERSION} (${release.version}) - ${ENV}`
  )
  console.info(`Running at http://${hostname()}:${PORT}`)
})

// Gracefully shutdown
const graceful = new Graceful({
  // uses `server.close` for graceful exit
  server,
  // uses `redisClient.quit` for graceful exit
  // redisClient,
  // default logger
  logger: console,
  // max time allowed in ms for graceful exit
  timeoutMs: 5000
})

graceful.listen()
