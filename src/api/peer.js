'use strict'
/**
 * Peer controller
 ******************************/

const logger = require('winston'),
  response = require('../lib/response')

/**
 * POST /auth
 */
exports.auth = async (ctx, next) => {
  const { publicKey: publicKeyArmored, timestamp, signature } = ctx.request.body
  const {
    keys: [publicKey]
  } = await openpgp.key.readArmored(publicKeyArmored)

  // Validate signature
  const verified = await openpgp.verify({
    message: openpgp.cleartext.fromText(timestamp),
    signature: await openpgp.signature.readArmored(signature),
    publicKeys: [publicKey]
  })
  const [valid] = verified.signatures
  if (!valid) {
    // Authorization has been refused due to invalid signature
    ctx.status = 401
    ctx.body = response.error(401, 'Invalid signature')
    return
  }
  // Signature verified so set user id for session
  const userId = publicKey.getFingerprint()
  ctx.app.emit('authed', userId, publicKey)
  ctx.body = response.success('Authenticated')
}
