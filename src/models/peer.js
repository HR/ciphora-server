'use strict'
/**
 * User model
 ******************************/

const logger = require('winston'),
  db = require('../lib/db'),
  utils = require('../lib/utils')

const PeerSchema = new db.Schema({
  _id: {
    type: String,
    unique: true,
    required: true
  },
  id: {
    type: String
  },
  lastActive: { type: Boolean, default: false }
}, {
  timestamps: true,
  id: true
})

module.exports = db.model('Peer', PeerSchema)