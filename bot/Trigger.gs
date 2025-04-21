function createTriggerForGenerate(user_id, data) {
  let user = new UserTable().getUserById(user_id)

  let telegram = createTelegramApp(PropertiesService.getScriptProperties().getProperty("TELEGRAM_BOT_ID"))
  telegram.chat_id = user_id

  if (user.credit >= 0) {
    new UserTable().updateUserCredit(telegram.chat_id, -1)
  }

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

function runGenerateForTrigger(event) {
  runTigger(event.triggerUid)
}

function runTigger(triggerUid) {
  Tamotsu.initialize()

  let data = JSON.parse(PropertiesService.getScriptProperties().getProperty(triggerUid))

  let telegram = createTelegramApp(PropertiesService.getScriptProperties().getProperty("TELEGRAM_BOT_ID"))
  telegram.chat_id = data[`user_id`]

  let response = telegram.sendMessage({
    text: `သင်၏ အချက်လက်များကို စတင်လုပ်ဆောင်နေပါသည်။ ပြီးဆုံးပါ ပြန်လည်အကြောင်းကြားပေးပါမည်။`
  })

  console.log(data[`data`])

  generateForTelegramUser(telegram, telegram.chat_id, data[`data`])

  ScriptApp.getProjectTriggers().some(function (trigger) {
    if (trigger.getUniqueId() === triggerUid) {
      ScriptApp.deleteTrigger(trigger)
      return true
    }

    return false
  })

  PropertiesService.getScriptProperties().deleteProperty(triggerUid)
}
