class SubmissionController {

  static invoke(request) {

    let payload = request.payload
    let data = payload[`data`]

    let saveData = {}

    if (data.save_data) {
      saveData = {
        postal_code: data.postal_code,
        unit_number: data.unit_number,
        generate_title: data.generate_title,
        long_term_list: data.long_term_list
      }
    }

    new UserTable().setUserSaveData(payload[`user_id`], saveData)

    createTriggerForGenerate(payload[`user_id`], data)

    request.response = `သင်၏ အချက်လက်များကို ရရှိပါပြီ။ မကြာခင် စတင်ဆောင်ရွက်ပါမည်။ ပြီးဆုံးပါက ပြန်လည်ပို့ဆောင်ပေးပါမည်။`

    return request
  }
}
