class TestApiController {

  static invoke(request) {

    request.response = "Hello"

    return request
  }
}
