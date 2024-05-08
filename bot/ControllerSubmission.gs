class SubmissionController {

  static invoke(request) {

    let data = request.payload

    createTriggerForGenerate(data[`user_id`], data[`data`])

    request.response = `သင်၏ အချက်လက်များကို ရရှိပါပြီ။ မကြာခင် စတင်ဆောင်ရွက်ပါမည်။ ပြီးဆုံးပါက ပြန်လည်ပို့ဆောင်ပေးပါမည်။`

    return request
  }
}
