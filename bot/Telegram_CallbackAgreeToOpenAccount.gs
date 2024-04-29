class TelegramCalbackAgreeToOpenAccount {
  static get() {
    return createCallback(
      `agree_to_open_account`,
      function (callback, telegram) {
        return TelegramCalbackAgreeToOpenAccount.execute(callback, telegram)
      }
    )
  }

  static execute(callback, telegram) {
    telegram.sendChatAction(new Action().TYPING)

    let response = null

    if (new UserTable().isUserExist(telegram.chat_id)) {
      response = telegram.editMessageText({
        text: `အကောင့်ဖွင့်ပြီးသားရှိပါသည်။`,
        reply_markup: createKeyboard().inline()
      })
    } else {
      new UserTable().createUser(telegram.chat_id, telegram.user_name, telegram.display_name)
      response = telegram.editMessageText({
        text: `အကောင့်ဖွင့်ခြင်း အောင်မြင်ပါသည်။`,
        reply_markup: createKeyboard().inline()
      })
    }

    response = telegram.setMyCommands(
      TelegramController.getMyCommands(telegram.chat_id).chatScope(telegram.chat_id).setMyCommands()
    )

    if (telegram.DEBUG) console.log(response)
    else return response
  }
}
