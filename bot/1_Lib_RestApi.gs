class Request {
  constructor(parameter) {
    for (const [key, value] of Object.entries(parameter)) {
      this[key] = value
    }
    this.status = SUCCESS
    this.message = SUCCESS_MESSAGE
    this.response = null
    this.viewFile = null
    this.view = null
    this.handlers = []
    this.renderView = null
    this.DEBUG = false
  }

  process() {
    let handlers = this.handlers
    for (var index in handlers) {
      var route = handlers[index]
      var result = route.condition(this)
      if (result) {
        return route.handle(this)
      } else {
        this.status = BAD_REQUEST
        this.message = BAD_REQUEST_MESSAGE
        return this.responseWithJson()
      }
    }
  }

  register(handler) {
    this.handlers.push(handler)
    return this
  }

  onRenderView(callback) {
    this.renderView = callback
    return this
  }

  responseWithJson() {
    var responseData = {
      status: this.status,
      message: this.message,
      data: this.response ? this.response : null
    }
    if (this.DEBUG) console.log(responseData)
    return ContentService.createTextOutput(JSON.stringify(responseData)).setMimeType(ContentService.MimeType.JSON)
  }
}

class Route {
  constructor() {
    this.routes = []
    this.auth = null
  }

  authMiddleware(callback) {
    this.auth = callback
    return this
  }

  on(route, callback, authRequire = false) {
    this.routes.push({ 'route': route, 'authRequire': authRequire, 'callback': callback })
    return this
  }

  condition(request) {
    return request.route != null
  }

  handle(request) {
    let response = null
    let routes = this.routes
    for (var index in routes) {
      var route = routes[index]
      let authMiddleware = this.auth
      if (request.route == route.route) {
        let auth = null

        if (authMiddleware != null && route.authRequire) auth = authMiddleware(request)

        if (auth != null && !auth.is_auth) {
          response = request
          response.status = UNAUTHORIZED_REQUEST
          if (response.message == SUCCESS_MESSAGE) {
            response.message = UNAUTHORIZED_REQUEST_MESSAGE
          }
        } else {
          if (auth != null) response = route.callback(auth)
          else response = route.callback(request)
        }
      }
    }

    if (response != null) {
      if (response.view != null || response.viewFile != null) return response.renderView(response.view, response.viewFile)
      else return response.responseWithJson()
    }

    request.status = NOT_FOUND
    request.message = ROUTE_NOT_FOUND
    return request.responseWithJson()
  }
}

// https://www.labnol.org/code/json-web-token-201128

const parseJwt = (jsonWebToken, privateKey) => {
  const [header, payload, signature] = jsonWebToken.split(".")
  const singatureBytes = Utilities.computeHmacSha256Signature(`${header}.${payload}`, privateKey)
  const validSignature = Utilities.base64EncodeWebSafe(singatureBytes)
  if (signature === validSignature.replace(/=+$/, '')) {
    const blob = Utilities.newBlob(Utilities.base64Decode(payload)).getDataAsString()
    return JSON.parse(blob)
  } else {
    return null
  }
}

const createJwt = ({ privateKey, expiresInHours, data = {} }) => {
  // Sign token using HMAC with SHA-256 algorithm
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  }

  const now = Date.now()
  const expires = new Date(now)
  expires.setHours(expires.getHours() + expiresInHours)

  // iat = issued time, exp = expiration time
  const payload = {
    exp: Math.round(expires.getTime() / 1000),
    iat: Math.round(now / 1000)
  }

  // add user payload
  Object.keys(data).forEach(function (key) {
    payload[key] = data[key]
  })

  const base64Encode = (text, json = true) => {
    const data = json ? JSON.stringify(text) : text
    return Utilities.base64EncodeWebSafe(data).replace(/=+$/, '')
  }

  const toSign = `${base64Encode(header)}.${base64Encode(payload)}`
  const singatureBytes = Utilities.computeHmacSha256Signature(toSign, privateKey)
  const singature = base64Encode(singatureBytes, false)
  return `${toSign}.${singature}`
}

const POST = "post"
const GET = "get"

const APPLICATION_JSON = `application/json`

const SUCCESS = 200
const NOT_FOUND = 404
const INTERNAL_ERROR = 500
const BAD_REQUEST = 400
const UNAUTHORIZED_REQUEST = 401
const UNPROCESSABLE_REQUEST = 422

const SUCCESS_MESSAGE = `Success`
const BAD_REQUEST_MESSAGE = `Bad request.`
const NOT_FOUND_MESSAGE = `Not found.`
const ROUTE_NOT_FOUND = `Route not found.`
const INTERNAL_ERROR_MESSAGE = `Internal server error.`
const UNAUTHORIZED_REQUEST_MESSAGE = `Unauthorized request.`
const UNPROCESSABLE_REQUEST_MESSAGE = "Unprocessable request."
