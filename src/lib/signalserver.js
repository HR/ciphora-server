'use strict'
/**
 * WebSocket Signal Server
 ******************************/

const logger = require('winston'),
  EventEmitter = require('events')
  .EventEmitter,
  WebSocketServer = require('ws')
  .Server,
  Ajv = require('ajv'),
  LRU = require("lru-cache"),
  messageSchema = require('../schema/message.json')

const ajv = new Ajv()
const validateMessage = ajv.compile(messageSchema)

class SignalServer extends EventEmitter {
  constructor(options = {}) {
    super()
    this._peers = {}
    this._server = new WebSocketServer(options)
    // Add event handlers
    this._server.on('connection', (peer, req, client) => this._onPeerConnection(peer))
    this._server.on('error', (error) => this._onServerError(error))
  }

  _onServerError(error) {
    this.emit('error', error)
  }

  _onPeerConnection(peer) {
    logger.debug('New peer connection')
    // Attach an 'event emitter' to peer for responses from server
    peer._emit = (event, data) => {
      let response = { event }
      if (data) response.data = data
      peer.send(JSON.stringify(response))
    }

    // Add event handlers to peer
    peer.on('message', (data) => this._onPeerMessage(peer, data))
    peer.on('error', (error) => this._onPeerError(peer, error))
    peer.on('close', (code, message) => this._onPeerClose(peer, code, message))
  }

  _onPeerError(peer, error) {
    peer._emit('error', error)
  }

  _onPeerMessage(peer, data) {
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

    // TODO: Add authentication via pgp signature for sender
    // Validate signal message format
    if (!validateMessage(msg)) {
      peer._emit('invalid-message')
      logger.warn('Invalid message from peer', msg.senderId)
      return
    }

    // Add peer as connected peer if not already added
    if (!this._isConnectedPeer(msg.senderId)) {
      this._addPeer(peer, msg.senderId)
    } else {
      logger.info('New signal from peer', msg.senderId)
    }

    // If it is just a connection message then we're done
    if (msg.type === 'connect') {
      return
    }

    // Check if recipient is connected
    if (!this._isConnectedPeer(msg.receiverId)) {
      peer._emit('unknown-receiver')
      logger.debug(`Unknown receiver peer ${msg.receiverId} from ${msg.senderId}`)
      return
    }

    // If signal then emit signal received event on peer otherwise pass through
    const peerEvent = (msg.type === 'signal') ? 'signal-received' : msg.type
    // Signal to receiving peer
    this._peers[msg.receiverId]._emit(peerEvent, msg)
    logger.info(`Sent signal to peer ${msg.receiverId} from ${msg.senderId} (${msg.type})`)
  }

  _onPeerClose(peer, code, message) {
    if (!!peer.id && this._isConnectedPeer(peer.id)) {
      // Remove the peer from the local peers list
      delete this._peers[peer.id]

      this.emit('remove-peer', peer.id)
      logger.info(`Removed peer ${peer.id} ${code} ${message}`)
    }
  }

  _addPeer(peer, peerId) {
    peer.id = peerId
    this._peers[peerId] = peer

    this.emit('add-peer', peer.id)
    logger.info(`Added peer ${peerId}`)
  }

  _isConnectedPeer(peerId) {
    return !!this._peers[peerId]
  }
}

exports = module.exports = SignalServer