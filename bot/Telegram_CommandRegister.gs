class TelegramCommandRegister {
  static get() {
    return createBotCommand({
      command: `/register`,
      description: `Register Account`,
      callback: function (command, telegram) {
        return TelegramCommandRegister.execute(command, telegram)
      }
    })
  }

  static execute(command, telegram) {
    telegram.sendChatAction(new Action().TYPING)

    let response = null

    if (new UserTable().isUserExist(telegram.chat_id)) {
      response = telegram.sendMessage({
        text: `အကောင့်ဖွင့်ပြီးသားရှိပါသည်။`
      })

      response = telegram.setMyCommands(
        TelegramController.getMyCommands(telegram.chat_id).chatScope(telegram.chat_id).setMyCommands()
      )

    } else {
      response = telegram.sendMessage({
        text: `အကောင့်ဖွင့်ဖို့ သဘောတူပါသလား။ အကောင့် ဖွင့်ဖွင့်ချင်း Credit ၁ ခုရရှိပါမည်။`,
        reply_markup: createKeyboard().buttons([
          keyCallback(`သဘောတူပါသည်။`, `agree_to_open_account`)
        ]).inline()
      })

      response = telegram.setMyCommands(
        TelegramController.getMyCommands(telegram.chat_id).chatScope(telegram.chat_id).setMyCommands()
      )
    }

    if (telegram.DEBUG) console.log(response)

    else return response
  }
}
