class TelegramCommandCheckCredit {
  static get() {
    return createBotCommand({
      command: `/checkcredit`,
      description: `Check Credit`,
      callback: function (command, telegram) {
        return TelegramCommandCheckCredit.execute(command, telegram)
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

      let credit = user.credit

      if (credit == -1) {
        credit = 0
      }

      response = telegram.sendMessage({
        text: `<b>Credit</b> - ${credit}`,
      })

      response = telegram.setMyCommands(
        TelegramController.getMyCommands(telegram.chat_id).chatScope(telegram.chat_id).setMyCommands()
      )
    }

    if (telegram.DEBUG) console.log(response)
    else return response
  }
}
