function createTriggerForGenerate(user_id, data) {
  let user = new UserTable().getUserById(user_id)

  let response = null
  let telegram = createTelegramApp(PropertiesService.getScriptProperties().getProperty("TELEGRAM_BOT_ID"))
  telegram.chat_id = user_id

  if (user.credit <= 0) {
    response = telegram.sendMessage({
      text: `သင့်တွင် <b>Credit 0</b> ဖြစ်နေသည့်အတွက် ဤလုပ်ဆောင်မှုကိုလုပ်ဆောင်၍ မရနိုင်ပါ။ ကျေးဇူးပြု၍ Credit ကို Topup လုပ်ပေးပါ။`,
      reply_markup: createKeyboard().buttons([keyUrl("Topup လုပ်ဖို့ ဆက်သွယ်ရန်", "tg://user?id=5440573899")]).inline()
    })
  } else {
    user = new UserTable().updateUserCredit(telegram.chat_id, -1)

    response = telegram.sendMessage({
      text: `သင်၏ အချက်လက်များကို ရရှိပါပြီ။ မကြာခင် စတင်ဆောင်ရွက်ပါမည်။ ပြီးဆုံးပါက ပြန်လည်ပို့ဆောင်ပေးပါမည်။`
    })

    let startDate = new Date()
    let nextDate = new Date(startDate.getTime() + 60 * 1000)
    if (nextDate.getSeconds() <= 45) {
      nextDate = new Date(nextDate.getTime() - nextDate.getSeconds() * 1000)
    }
    let trigger = ScriptApp.newTrigger(`runGenerateForTrigger`).timeBased().at(nextDate).create()

    PropertiesService.getScriptProperties().setProperty(
      trigger.getUniqueId(),
      JSON.stringify({
        user_id: user_id,
        data: data
      })
    )
  }

  console.log(response)
}

function runGenerateForTrigger(event) {
  Tamotsu.initialize()

  let data = JSON.parse(PropertiesService.getScriptProperties().getProperty(event.triggerUid))

  let telegram = createTelegramApp(PropertiesService.getScriptProperties().getProperty("TELEGRAM_BOT_ID"))
  telegram.chat_id = data[`user_id`]

  generateForTelegramUser(telegram, telegram.chat_id, data[`data`])

  ScriptApp.getProjectTriggers().some(function (trigger) {
    if (trigger.getUniqueId() === event.triggerUid) {
      ScriptApp.deleteTrigger(trigger)
      return true
    }

    return false
  })

  PropertiesService.getScriptProperties().deleteProperty(event.triggerUid)
}
