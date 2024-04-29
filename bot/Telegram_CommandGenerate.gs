class TelegramCommandGenerate {
  static get() {
    return createBotCommand({
      command: `/generate`,
      description: `Generate PUB Share`,
      callback: function (command, telegram) {
        return TelegramCommandGenerate.execute(command, telegram)
      }
    })
  }

  static execute(command, telegram) {

    let response = null

    if (!new UserTable().isUserExist(telegram.chat_id)) {
      TelegramCommandRegister.execute(command, telegram)
    } else {
      telegram.sendChatAction(new Action().TYPING)

      let user = new UserTable().getUserById(telegram.chat_id)

      if (parseInt(user.credit) == 0) {
        response = telegram.sendMessage({
          text: `PUB Share တွက်ချက်မှု အတွက် <b>1 Credit</b> ကုန်ကျပါမည်။ သို့သော် သင့်တွင် <b>0 Credit</b> ဖြစ်နေသည့်အတွက် ဤလုပ်ဆောင်မှုကို မလုပ်ဆောင်နိုင်ပါ။`
        })

        response = telegram.sendMessage({
          text: `Credit ဝယ်ပြီးမှ ပြန်လည်လုပ်ဆောင်ပေးပါ။ Credit ဝယ်ရန်အတွက် ဆက်သွယ်ပေးပါ။`
        })
      } else {
        response = telegram.sendMessage({
          text: `PUB Share တွက်ချက်မှု အတွက် <b>1 Credit</b> ကို သင့်ထံမှ နှုတ်ယူသွားမည်ဖြစ်ပါသည်။ လက်ရှိ သင့်၏ လက်ကျန် Credit မှာ <b>${user.credit} Credit</b> ဖြစ်ပါသည်။ လုပ်ဆောင်လိုပါက <b>Continue</b> ကို နှိပ်ပြီး လုပ်ဆောင်နိုင်ပါသည်။`,
          reply_markup: createKeyboard().buttons([
            keyWebApp(`Continue`, PropertiesService.getScriptProperties().getProperty("WEB_APP_URL"))
          ]).resize(true).oneTime(true).reply()
        })
      }

      response = telegram.setMyCommands(
        TelegramController.getMyCommands(telegram.chat_id).chatScope(telegram.chat_id).setMyCommands()
      )
    }

    if (telegram.DEBUG) console.log(response)
    else return response
  }
}
