class GetSaveDataController {

  static invoke(request) {

    let user_id = request.payload[`user_id`]

    let user = new UserTable().getUserById(user_id)

    try {
      request.response = JSON.parse(user.save_data)
    } catch (e) {
      request.response = {}
    }

    return request
  }
}
