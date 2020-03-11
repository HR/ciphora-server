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
  messageSchema = require('../schema/message.json')

const ajv = new Ajv()
const validateMessage = ajv.compile(messageSchema)

class SServer extends EventEmitter {
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
    // Add event handlers to peer
    peer.on('message', (data) => this._onPeerMessage(peer, data))
    peer.on('error', (error) => this._onPeerError(peer, error))
    peer.on('close', (code, message) => this._onPeerClose(peer, code, message))
  }

  _onPeerError(peer, error) {
    peer.emit('error', error)
  }

  _onPeerMessage(peer, data) {
    let msg = null
    // Try to parse message as JSON
    try {
      msg = JSON.parse(data)
    } catch (err) {
      peer.emit('invalid-json')
      logger.warn('Invalid JSON from peer')
      return
    }

    // TODO: Add authentication via signature for sender
    // Validate signal message format
    if (!validateMessage(msg)) {
      peer.emit('invalid-message')
      logger.warn('Invalid message from peer')
      return
    }

    // Add peer as connected peer if not already added
    if (!this._isConnectedPeer(msg.senderId)) {
      this._addPeer(peer, msg.senderId)
    } else {
      logger.info('New signal from peer ' + msg.senderId)
    }

    // Check if recipient is connected
    if (!this._isConnectedPeer(msg.receiverId)) {
      peer.emit('unknown-receiver', msg.receiverId)
      logger.debug(`Unknown receiver peer ${msg.receiverId} from ${msg.senderId}`)
      return
    }

    // It's a connected peer so send signal to it
    this._peers[msg.receiverId].send(data)
    peer.emit('signal-sent')
    logger.info(`Sent signal to peer ${msg.receiverId} from ${msg.senderId}`)
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

exports = module.exports = SServer