class TelegramWebAppSubmit {
  static get() {
    return createWebAppReply({
      button_text: `Continue`,
      callback: function (web_app, telegram) {
        return TelegramWebAppSubmit.execute(web_app, telegram)
      }
    })
  }

  static execute(web_app, telegram) {
    let response = null

    if (!new UserTable().isUserExist(telegram.chat_id)) {
      TelegramCommandRegister.execute(command, telegram)
    } else {
      telegram.sendChatAction(new Action().TYPING)

      let user = new UserTable().getUserById(telegram.chat_id)

      if (user.credit <= 0) {
        response = telegram.sendMessage({
          text: `သင့်တွင် <b>Credit 0</b> ဖြစ်နေသည့်အတွက် ဤလုပ်ဆောင်မှုကိုလုပ်ဆောင်၍ မရနိုင်ပါ။ ကျေးဇူးပြု၍ Credit ကို Topup လုပ်ပေးပါ။`,
          reply_markup: createKeyboard().buttons([keyUrl("Topup လုပ်ဖို့ ဆက်သွယ်ရန်", "tg://user?id=5440573899")]).inline()
        })
      } else {
        user = new UserTable().updateUserCredit(telegram.chat_id, -1)

        response = telegram.sendMessage({
          text: `သင်၏ အချက်အလက်များကို စတင်ဆောင်ရွက်နေပါသည်။ ပြီးဆုံးပါက ပြန်လည်ပို့ဆောင်ပေးပါမည်။`
        })

        generateForTelegramUser(telegram, telegram.chat_id, JSON.parse(telegram.web_app_data.data))
      }
    }

    if (telegram.DEBUG) console.log(response)
    else return response
  }
}
