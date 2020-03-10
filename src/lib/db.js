'use strict'
/**
 * DB (connector)
 ******************************/

const logger = require('winston'),
	mongoose = require('mongoose'),
	{ MONGODB_URI, IN_DEV } = require('../../config')

if (IN_DEV) {
  mongoose.set('debug', true)
}

if (mongoose.connection.readyState != 1) {
	mongoose.connect(MONGODB_URI, {
		autoIndex: false,
		useNewUrlParser: true,
    useUnifiedTopology: true
	})
}

// When successfully connected
mongoose.connection.on('connected', function () {
	console.info(`Mongoose default connection opened ✅`)
})

// If the connection throws an error
mongoose.connection.on('error', function (err) {
	console.error(err)
})

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {
	console.info('Mongoose default connection disconnected')
})

module.exports = mongoose