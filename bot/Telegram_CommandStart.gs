class TelegramCommandStart {
  static get() {
    return createBotCommand({
      command: `/start`,
      description: `Start Bot`,
      callback: function (command, telegram) {
        return TelegramCommandStart.execute(command, telegram)
      }
    })
  }

  static execute(command, telegram) {
    telegram.sendChatAction(new Action().TYPING)

    let response = null

    response = telegram.sendMessage({
      text: `Welcome from PUB Share Generate Bot.`,
    })

    response = telegram.setMyCommands(
      TelegramController.getMyCommands(telegram.chat_id).chatScope(telegram.chat_id).setMyCommands()
    )

    if (telegram.DEBUG) console.log(response)
    else return response
  }
}
