let doPost = (e) => {

  Tamotsu.initialize()

  let telegramController = new TelegramController(e)

  if (telegramController.isTelegramRequest()) {
    telegramController.run()
    return
  }
}
