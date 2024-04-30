let checkUserAuth = (request) => {
  let user_id = request.payload.user_id

  request.is_auth = new UserTable().isUserExist(user_id)

  return request
}
