class TelegramCommandBuyCredit {
  static get() {
    return createBotCommand({
      command: `/buycredit`,
      description: `Buy Credit`,
      callback: function (command, telegram) {
        return TelegramCommandBuyCredit.execute(command, telegram)
      }
    })
  }

  static execute(command, telegram) {
    telegram.sendChatAction(new Action().TYPING)

    let response = null

    response = telegram.sendMessage({
      text: `Credit ဝယ်ရန် အတွက် ဆက်သွယ်ပေးပါ။`,
      reply_markup: createKeyboard().buttons([keyUrl("ဆက်သွယ်ရန်", "tg://user?id=5440573899")]).inline()
    })

    if (telegram.DEBUG) console.log(response)
    else return response
  }
}
