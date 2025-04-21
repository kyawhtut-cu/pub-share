let doGet = (e) => {

  Tamotsu.initialize()

  if (e.parameter.payload) {
    e.parameter.payload = JSON.parse(e.parameter.payload)
  }

  // Instantiate Request
  let request = new Request(e.parameter)
  request.DEBUG = true

  // Builing routes
  let route = new Route()

  route.authMiddleware(function (request) {
    if (request.route.startsWith(`submit_generate_data`) || request.route.startsWith(`get_save_data`)) {
      return checkUserAuth(request)
    } else request
  })

  route.on(`submit_generate_data`, SubmissionController.invoke, true)

  route.on(`get_save_data`, GetSaveDataController.invoke, true)

  route.on(`submit_test_api`, TestApiController.invoke, false)

  // Register the route with request
  request.register(route)

  return request.process()
}

let doPost = (e) => {

  Tamotsu.initialize()

  let telegramController = new TelegramController(e)

  if (telegramController.isTelegramRequest()) {
    telegramController.run()
    return
  }

  let parameter = null
  if (e.postData && e.postData.contents) {
    parameter = JSON.parse(e.postData.contents)
  } else if (e.parameter) {
    parameter = e.parameter
    if (parameter.payload) {
      parameter.payload = JSON.parse(parameter.payload)
    }
  } else {
    request.status = BAD_REQUEST
    request.message = BAD_REQUEST_MESSAGE
    return request.responseWithJson()
  }

  // Instantiate Request
  let request = new Request(parameter)
  request.DEBUG = true

  // Builing routes
  let route = new Route()

  route.authMiddleware(function (request) {
    if (request.route.startsWith("submit_generate_data")) {
      return checkUserAuth(request)
    } else request
  })

  route.on(`submit_generate_data`, SubmissionController.invoke, true)

  // Register the route with request
  request.register(route)

  return request.process()
}

let testDoPostParameter = () => {
  doPost({
    parameter: {
      "route": `submit_generate_data`,
      payload: JSON.stringify({
        "user_id": 5440573899,
        "data": {
          generate_title: 'April 2024',
          pub_start_date: `20-02-2025`,
          pub_end_date: `19-03-2025`,
          pub_amount: 1,
          internet_amount: 1,
          postal_code: '730863',
          unit_number: '13',
          long_term_list:
            [
              { no: '1', name: 'Name One' },
              { no: '2', name: 'Name Two' },
              { no: '3', name: 'Name Three' },
              { no: '4', name: 'Name Four' },
              { no: '5', name: 'Name Five' },
              { no: '6', name: 'Name Six' }
            ],
          short_term_list:
            [
              {
                no: '1',
                name: 'Short Term One',
                date: '01-04-2024\n02-04-2024'
              },
              {
                no: '2',
                name: 'Short Term Two',
                date: '01-04-2024\n02-04-2024'
              }
            ]
        }
      })
    }
  })
}
