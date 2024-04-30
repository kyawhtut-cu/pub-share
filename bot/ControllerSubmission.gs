class SubmissionController {

  static invoke(request) {

    let data = request.payload

    createTriggerForGenerate(data[`user_id`], data[`data`])

    return request
  }
}
