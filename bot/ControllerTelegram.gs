function setWebhook() {
  let controller = new TelegramController({})
  controller.setWebhook()
}

class TelegramController {

  static getRegisterCommands() {
    let list = createBotCommandList()

    list.addBotCommand(TelegramCommandStart.get())
    list.addBotCommand(TelegramCommandRegister.get())
    list.addBotCommand(TelegramCommandBuyCredit.get())
    list.addBotCommand(TelegramCommandCheckCredit.get())
    list.addBotCommand(TelegramCommandGenerate.get())

    return list
  }

  static getMyCommands(userId) {
    let list = createBotCommandList()

    list.addBotCommand(TelegramCommandStart.get())

    if (!new UserTable().isUserExist(userId)) {
      list.addBotCommand(TelegramCommandRegister.get())
    } else {
      list.addBotCommand(TelegramCommandBuyCredit.get())
      list.addBotCommand(TelegramCommandCheckCredit.get())
      list.addBotCommand(TelegramCommandGenerate.get())
    }

    return list
  }

  constructor(e) {
    this.DEBUG = false

    let telegram = createTelegramApp(PropertiesService.getScriptProperties().getProperty("TELEGRAM_BOT_ID"))
    telegram.setRequest(e)

    Logger.log(JSON.stringify(e))

    this.Telegram = telegram
  }

  run() {

    this.Telegram.registerBotCommands(
      TelegramController.getRegisterCommands().commands
    )

    this.Telegram.registerCallback(TelegramCalbackAgreeToOpenAccount.get())

    this.Telegram.registerWebAppReply(TelegramWebAppSubmit.get())

    // this.Telegram.registerWebAppReply()
    this.Telegram.run()
  }

  setDebug(isDebug) {
    this.DEBUG = isDebug
    this.Telegram.DEBUG = isDebug
    return this
  }

  isTelegramRequest() {
    return this.Telegram.isTelegramRequest()
  }

  setWebhook() {
    let response = this.Telegram.setWebhook(PropertiesService.getScriptProperties().getProperty("WEB_HOOK"))
    if (this.DEBUG) console.log(JSON.stringify(response))
    else return response
  }

  deleteWebhook() {
    let response = this.Telegram.deleteWebhook()
    if (this.DEBUG) console.log(JSON.stringify(response))
    else return response
  }
}
