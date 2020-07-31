let headerFormatter = require('./_res-header-fmt')

/**
 * Arc 6+ HTTP API + Lambda v2.0 response formatter
 * - Mocks response object shape for API Gateway / Lambda proxy integration
 */
module.exports = function responseFormatter ({ res, result }) {
  /**
   * Implicit JSON returns
   */
  function okGw (response) {
    res.statusCode = 200
    res.setHeader('content-type', 'application/json') // For some reason, sans 'charset=utf-8'
    return response
  }
  // Bail early if no return. This is actual API Gateway behavior.
  if (!result) {
    return okGw('null')
  }

  let { body, cookies = [], headers, statusCode, isBase64Encoded } = result

  // Apply all that funky stuff AWS loves doing to our headers
  headers = headerFormatter(headers)

  // Yes, HTTP API implicit JSON returns really do all these things
  if (!statusCode) {
    if (typeof result === 'string') {
      return okGw(result)
    }
    if (typeof body === 'string') {
      return okGw(body)
    }
    return okGw(JSON.stringify(result))
  }

  /**
   * Explicit returns
   *   ie we got a statusCode
   */
  // HTTP status
  res.statusCode = result.statusCode || 200

  // Content type
  // Special because it gets a fallback
  let contentType = headers && headers['content-type']
  res.setHeader('content-type', contentType || 'text/plain; charset=utf-8;')

  // Headers
  if (headers) {
    Object.keys(headers).forEach(k => {
      res.setHeader(k, headers[k])
      if (k === 'set-cookie') cookies.push(headers[k])
    })
  }

  // Cookie time
  if (cookies.length) {
    let sheet = cookies.join('; ')
    res.setHeader('set-cookie', sheet)
  }
  // TODO reimpl?
  // if (!Array.isArray(headers[k]))
  //   res.setHeader(k, headers[k].replace('; Secure', '; Path=/'))
  // else {
  //   res.setHeader(k, headers[k].map(value => value.replace('; Secure', '; Path=/')))
  // }

  /**
   * Arc v6 endpoint binary responses
   * - Any endpoint can emit binary responses via base64-encoded body + isBase64Encoded: true
   */
  let base64EncodedBody = isBase64Encoded && (body && typeof body === 'string')
  if (base64EncodedBody) {
    body = Buffer.from(body, 'base64')
  }

  // isBase64Encoded flag passthrough
  if (isBase64Encoded) {
    res.isBase64Encoded = true
  }

  return body
}
