'use strict'
/**
 * Runs the server
 ******************************/

const http = require('http'),
  Server = require('./src/lib/Server'),
  release = require('./package.json'),
  { ENV, PORT } = require('./config')

/**
 * Create server
 **/
const httpServer = http.createServer((req, res) => {
  console.info(`--> ${req.method} ${req.url}`)
  res.end('Wubba lubba dub dub!')
})
const server = new Server(httpServer)
// Catch all errors
server.on('error', console.error)

/**
 * Start server
 **/
httpServer.listen(PORT, () => {
  console.info(`Started for Ciphora Server (${release.version}) - ${ENV}`)
  console.info(`Running on port ${PORT}`)
})
