'use strict'
/**
 * API Utils
 ******************************/

const openpgp = require('openpgp')

// Verifies a pgp signature for data
exports.pgpVerify = async (publicKeyArmored, data, signature) => {
  // Fail verification if all params are not supplied
  if (!publicKeyArmored || !data || !signature) return false

  const {
    keys: [publicKey]
  } = await openpgp.key.readArmored(publicKeyArmored)

  // Validate signature
  const verified = await openpgp.verify({
    message: openpgp.cleartext.fromText(data),
    signature: await openpgp.signature.readArmored(signature),
    publicKeys: [publicKey]
  })

  const { valid } = verified.signatures[0]
  const userId = publicKey.getFingerprint()
  return { valid, userId }
}
