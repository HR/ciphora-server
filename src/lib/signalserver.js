'use strict'
/**
 * WebSocket Signal Server
 ******************************/

const logger = require('winston'),
  EventEmitter = require('events').EventEmitter,
  { parse } = require('url'),
  WebSocketServer = require('ws').Server,
  Ajv = require('ajv'),
  messageSchema = require('../schema/message.json')

const ajv = new Ajv()
const validateMessage = ajv.compile(messageSchema)

class SignalServer extends EventEmitter {
  constructor (server) {
    super()

    this._peers = {}
    this._connections = {}
    this._server = new WebSocketServer(server)
    // Add event handlers
    this._server.on('connection', this._onPeerConnection)
    this._server.on('error', this._onServerError)
    // Authenticate when peer tries to establish websocket connection
    server.on('upgrade', this._authenticatePeer)

    this._authenticatePeer = this._authenticatePeer.bind(this)
  }

  addPeer (peerId, publicKey) {
    console.log(arguments)
    this._peers[peerId] = { publicKey }
    console.log('Added authenticated peer', peerId, publicKey)
  }

  _authenticatePeer (request, socket, head) {
    const query = url.parse(request.url, true).query
    console.log('Parsed query', query)
    if (!this._peers[query.id]) {
      console.log('Unauthenticated peer', query.id)
      // Unauthenticated so reject connection
      socket.destroy()
      return
    }

    this._server.handleUpgrade(request, socket, head, function (ws) {
      this._server.emit('connection', ws, request)
    })
  }

  _onServerError (error) {
    this.emit('error', error)
  }

  _onPeerConnection (peer, req, client) {
    logger.debug('New peer connection')
    // Attach an 'event emitter' to peer for responses from server
    peer._emit = (event, data) => {
      let response = { event }
      if (data) response.data = data
      peer.send(JSON.stringify(response))
    }
    // Add peer connection
    this._addConnection(peer)

    // Add event handlers to peer
    peer.on('message', data => this._onPeerMessage(peer, data))
    peer.on('error', error => this._onPeerError(peer, error))
    peer.on('close', (code, message) => this._onPeerClose(peer, code, message))
  }

  _onPeerError (peer, error) {
    peer._emit('error', error)
  }

  _onPeerMessage (peer, data) {
    let msg = null
    // Try to parse message as JSON
    try {
      msg = JSON.parse(data)
    } catch (err) {
      peer._emit('invalid-json')
      logger.warn('Invalid JSON from peer')
      return
    }

    console.log(data)

    // Validate signal message format
    if (!validateMessage(msg)) {
      peer._emit('invalid-message')
      logger.warn('Invalid message from peer', msg.senderId)
      return
    }

    // If it is just a connection message then we're done
    if (msg.type === 'connect') {
      return
    }

    // Check if recipient is connected
    if (!this._isConnected(msg.receiverId)) {
      peer._emit('unknown-receiver', msg.receiverId)
      logger.debug(
        `Unknown receiver peer ${msg.receiverId} from ${msg.senderId}`
      )
      return
    }

    // Signal to receiving peer
    this._connections[msg.receiverId]._emit(msg.type, msg)
    logger.info(
      `Sent signal to peer ${msg.receiverId} from ${msg.senderId} (${msg.type})`
    )
  }

  _onPeerClose (peer, code, message) {
    if (!!peer.id && this._isConnected(peer.id)) {
      // Remove the peer from the local peers list
      delete this._connections[peer.id]
      delete this._peers[peer.id]
      logger.info(`Removed peer ${peer.id} ${code} ${message}`)
    }
  }

  _addConnection (peer, peerId) {
    peer.id = peerId
    this._connections[peerId] = peer
    logger.info(`Added peer connection ${peerId}`)
  }

  _isConnected (peerId) {
    return !!this._connections[peerId]
  }
}

exports = module.exports = SignalServer
