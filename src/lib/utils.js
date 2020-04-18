'use strict'
/**
 * Utilities
 ******************************/

const openpgp = require('openpgp'),
  { SIGNATURE_EXPIRE_TIME } = require('../../config')

// Verifies a pgp signature is valid and not expired and returns the userId
exports.pgpVerify = async (publicKeyArmored, timestamp, signature) => {
  // Fail verification if all params are not supplied
  if (!publicKeyArmored || !timestamp || !signature) return false

  // Parse public key
  const {
    keys: [publicKey]
  } = await openpgp.key.readArmored(publicKeyArmored)

  // Validate signature
  const verified = await openpgp.verify({
    message: openpgp.cleartext.fromText(timestamp),
    signature: await openpgp.signature.readArmored(signature),
    publicKeys: [publicKey]
  })

  // Check if signature has expired (is older than SIGNATURE_EXPIRE_TIME)
  const signatureTime = new Date(timestamp)
  const isExpired = new Date() - signatureTime > SIGNATURE_EXPIRE_TIME

  const valid = verified.signatures[0].valid && !isExpired
  const userId = publicKey.getFingerprint()
  return { valid, userId }
}
