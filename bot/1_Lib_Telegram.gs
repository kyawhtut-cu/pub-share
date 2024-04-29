class TelegramApp {

  constructor(bot_id) {
    this.DEBUG = false
    this.bot_id = bot_id
    this.telegram_request = null

    this.user_name = null
    this.first_name = null
    this.last_name = null
    this.display_name = null

    this.messageObj = null

    this.chat_id = null
    this.text = ``

    this.message_id = null
    this.message_replys = []
    this.message_default_reply = null

    this.bot_commands = []
    this.bot_command_default_reply = null

    this.callbacks = []
    this.callback_default_reply = null

    this.message = null
    this.bot_command = null
    this.callback = null

    this.shipping_address_provider = null

    this.pre_checkout_query_id = null

    this.shipping_query_id = null

    this.successful_payment = null

    this.web_app_data = null
    this.web_app_replys = []
    this.web_app_default_reply = null

    this.answer_shipping_query_reply = null
    this.successful_payment_reply = null

    this.entities = []
    this.reply_to_message = null

    this.member_blocked_action = null

    this.is_telegram_request = false
    this.botURL = `https://api.telegram.org/bot${bot_id}/`
  }

  processUser(message) {
    this.messageObj = message

    this.user_name = message.chat.username
    this.first_name = message.chat.first_name
    if (this.first_name == null) this.first_name = ``
    this.last_name = message.chat.last_name
    if (this.last_name == null) this.last_name = ``
    else this.last_name = ` ` + this.last_name
    this.display_name = this.first_name + this.last_name
  }

  setRequest(request) {
    this.is_telegram_request = false

    if (!request.postData || !request.postData.contents) {
      return
    }

    let payload = JSON.parse(request.postData.contents)

    if (payload.message != null || (payload.message && payload.message.reply_to_message) != null || payload.callback_query != null || payload.pre_checkout_query != null || payload.shipping_address != null || payload.my_chat_member != null) {
      this.is_telegram_request = true
    }

    if (!this.is_telegram_request) return

    this.telegram_request = payload

    if (payload.message) {

      this.processUser(payload.message)

      this.chat_id = payload.message.from.id
      this.message_id = payload.message.message_id

      if (payload.message.reply_to_message && payload.message.reply_to_message.forward_from) {
        this.text = payload.message.text
        this.entities = payload.message.entities
        this.reply_to_message = payload.message.reply_to_message
      } else if (isBotCommandMessage(payload.message)) {
        this.entities = payload.message.entities
        this.bot_command = payload.message.text
      } else if (payload.message.text != null) {
        this.entities = payload.message.entities
        this.message = payload.message.text
      } else if (payload.message.successful_payment != null) {
        this.successful_payment = payload.message.successful_payment
      } else if (payload.message.web_app_data) {
        this.web_app_data = payload.message.web_app_data
      }

    } else if (payload.callback_query) {

      this.processUser(payload.callback_query.message)

      this.chat_id = payload.callback_query.from.id
      this.text = payload.callback_query.message.text
      this.message_id = payload.callback_query.message.message_id

      this.callback = payload.callback_query.data

    } else if (payload.pre_checkout_query) {

      this.processUser({
        chat: payload.pre_checkout_query.from
      })

      this.pre_checkout_query_id = payload.pre_checkout_query.id
      this.chat_id = payload.pre_checkout_query.from.id

    } else if (payload.shipping_query) {
      this.processUser({
        chat: payload.shipping_query.from
      })

      this.shipping_query_id = payload.shipping_query.id
      this.chat_id = payload.shipping_query.from.id
    } else if (payload.successful_payment) {
    }
  }

  run() {
    if (!this.is_telegram_request) return
    if (this.telegram_request.my_chat_member != null) {
      let newStatus = this.telegram_request.my_chat_member.new_chat_member.status ?? ``
      let oldStatus = this.telegram_request.my_chat_member.old_chat_member ? this.telegram_request.my_chat_member.old_chat_member.status ?? `` : ``
      if (newStatus == `kicked`) {
        this.member_blocked_action(
          this.telegram_request.my_chat_member.chat.id,
          true
        )
      } else if (newStatus == `member` && oldStatus == `kicked`) {
        this.member_blocked_action(
          this.telegram_request.my_chat_member.chat.id,
          false
        )
      }
      return
    }
    if (this.bot_command != null) {

      for (var index in this.bot_commands) {
        var bot_command = this.bot_commands[index]

        if (bot_command.isEqualCommand(this.bot_command)) {
          return bot_command.run(this)
        }
      }

      if (this.bot_command_default_reply != null) return this.bot_command_default_reply.execute(this)

      return this.replyDefault(`<strong>Auto Reply</strong>\nCommand not found.`)

    } else if (this.callback != null) {

      for (var index in this.callbacks) {
        var callback = this.callbacks[index]

        if (callback.isEqualCallback(this.callback)) {
          return callback.run(this)
        }
      }

      if (this.callback_default_reply != null) return this.callback_default_reply.execute(this)

      return this.replyDefault(`<strong>Auto Reply</strong>\nCallback not found.`)

    } else if (this.message != null) {

      for (var index in this.message_replys) {
        var message_reply = this.message_replys[index]

        if (message_reply.isEqualMessage(this.message)) {
          return message_reply.run(this)
        }
      }

      console.log(this.message_default_reply)
      if (this.message_default_reply != null) return this.message_default_reply.execute(this)

      return this.replyDefault(`<strong>Auto Reply</strong>\nBot doesn't understand your input.`)

    } else if (this.pre_checkout_query_id != null) {

      return this.answerPreCheckoutQuery(true)

    } else if (this.shipping_query_id != null) {

      return this.answerShippingQuery(true)

    } else if (this.successful_payment) {

      if (this.successful_payment_reply != null) return this.successful_payment_reply.execute(this)
      else return this.sendMessage(
        {
          text: `Thank you for your 'payment'! Don't worry, your imaginary credit card was not charged.\n\nAt this step, the user should receive a confirmation message with information about the delivery or any further steps for obtaining the services they paid for.`
        }
      )

    } else if (this.web_app_data != null) {

      for (var index in this.web_app_replys) {
        var reply = this.web_app_replys[index]

        if (reply.isEqualWebAppReply(this.web_app_data.button_text, this.web_app_data.data)) {
          return reply.run(this)
        }
      }

      if (this.web_app_default_reply != null) return this.web_app_default_reply.execute(this)

      return this.replyDefault(`<strong>Auto Reply</strong>\nWeb app reply not found.`)

    } else if (this.reply_to_message != null) {

      return this.sendMessage({
        text: this.text,
        chat_id: this.reply_to_message.forward_from.id,
        entities: this.entities
      })

    }
  }

  isTelegramRequest() {
    return this.is_telegram_request
  }

  setChatId(chatId) {
    this.chat_id = chatId
    return this
  }

  getChatId() {
    return this.chat_id
  }

  setMessageId(message_id) {
    this.mesage_id = message_id
    return this
  }

  getMessageId() {
    return this.message_id
  }

  setMemberBlockedAction(action) {
    this.member_blocked_action = action
    return this
  }

  registerMessageReply(message_reply) {
    this.message_replys.push(message_reply)
    return this
  }

  registerMessageReplys(message_replys) {
    message_replys.forEach(message_reply => {
      this.message_replys.push(message_reply)
    })
    return this
  }

  setMessageDefaultReply(message_default_reply) {
    this.message_default_reply = message_default_reply
    return this
  }

  registerBotCommand(botCommand) {
    this.bot_commands.push(botCommand)
    return this
  }

  registerBotCommands(bot_commands) {
    bot_commands.forEach(botCommand => {
      this.bot_commands.push(botCommand)
    })
    return this
  }

  setBotCommandDefaultReply(bot_command_default_reply) {
    this.bot_command_default_reply = bot_command_default_reply
    return this
  }

  registerCallback(callback) {
    this.callbacks.push(callback)
    return this
  }

  regiseterCallbacks(callbacks) {
    callbacks.forEach(callback => {
      this.callbacks.push(callback)
    })
    return this
  }

  setCallbackDefaultReply(callback_default_reply) {
    this.callback_default_reply = callback_default_reply
    return this
  }

  registerWebAppReply(reply) {
    this.web_app_replys.push(reply)
    return this
  }

  registerWebAppReplys(replys) {
    replys.forEach(callback => {
      this.web_app_replys.push(callback)
    })
    return this
  }

  setWebAppDefaultReply(web_app_default_reply) {
    this.web_app_default_reply = web_app_default_reply
    return this
  }

  setSuccessfulPaymentReply(successful_payment_reply) {
    this.successful_payment_reply = successful_payment_reply
    return this
  }

  setAnswerShippingQueryReply(answer_shipping_query_reply) {
    this.answer_shipping_query_reply = answer_shipping_query_reply
    return this
  }

  setWebhook(url) {
    return this.fetch({
      route: `setWebhook`,
      payload: {
        url: url
      }
    })
  }

  deleteWebhook() {
    return this.fetch({
      route: `deleteWebhook`
    })
  }

  getUpdates() {
    return this.fetch({
      route: `getUpdates`
    })
  }

  sendMessage({
    text, chat_id = this.getChatId(),
    parse_mode = `html`,
    reply_markup = createKeyboard().remove(),
    reply_to_message_id = null,
    entities = []
  }) {
    let payload = {
      text: text,
      chat_id: chat_id,
      parse_mode: parse_mode,
      entities: entities
    }

    if (reply_markup != null) payload["reply_markup"] = reply_markup
    if (reply_to_message_id != null) payload["reply_to_message_id"] = reply_to_message_id

    return this.fetch({
      route: `sendMessage`,
      payload: payload
    })
  }

  sendPhoto({
    photo,
    chat_id = this.getChatId(),
    caption = null,
    parse_mode = `html`,
    reply_markup = createKeyboard().remove()
  }) {
    let payload = {
      photo: photo,
      caption: caption,
      chat_id: chat_id,
      parse_mode: parse_mode
    }

    if (reply_markup != null) payload["reply_markup"] = reply_markup

    return this.fetch({
      route: `sendPhoto`,
      payload: payload
    })
  }

  sendPhotoFile({
    photo,
    chat_id = this.getChatId(),
    caption = null,
    parse_mode = `html`,
    reply_markup = createKeyboard().remove()
  }) {
    let payload = {
      photo: photo
    }

    if (reply_markup != null) payload["reply_markup"] = JSON.stringify(reply_markup)

    let option = {
      method: "POST",
      muteHttpExceptions: true,
      payload: payload
    }

    let response = UrlFetchApp.fetch(
      `${this.botURL}sendPhoto?chat_id=${chat_id}&parse_mode=${parse_mode}&captio=${caption}`,
      option
    ).getContentText()

    return response
  }

  sendDocument({
    documentFile,
    chat_id = this.getChatId(),
    caption = null,
    parse_mode = `html`,
    reply_markup = createKeyboard().remove()
  }) {
    let payload = {
      document: documentFile
    }

    if (reply_markup != null) payload["reply_markup"] = JSON.stringify(reply_markup)

    let option = {
      method: "POST",
      muteHttpExceptions: true,
      payload: payload
    }

    let response = UrlFetchApp.fetch(
      `${this.botURL}sendDocument?chat_id=${chat_id}&parse_mode=${parse_mode}&captio=${caption}`,
      option
    ).getContentText()

    return response
  }

  sendInvoice({
    chat_id = this.chat_id,
    title, description,
    payload, currency = "SGD",
    prices,
    max_tip_amount = null,
    suggested_tip_amounts = [],
    photo_url = null,
    need_name = null,
    need_phone_number = null,
    need_email = null,
    need_shipping_address = null,
    send_phone_number_to_provider = null,
    send_email_to_provider = null,
    is_flexible = null,
    reply_markup = createKeyboard().remove()
  }) {
    let payload_data = {
      chat_id,
      title,
      description,
      payload,
      currency,
      prices,
      provider_token: "284685063:TEST:MmE0MmI4Y2ZmODcw"
    }

    if (max_tip_amount != null) {
      payload_data["max_tip_amount"] = max_tip_amount
    }

    if (suggested_tip_amounts.length > 0) {
      payload_data["suggested_tip_amounts"] = suggested_tip_amounts
    }

    if (photo_url != null) {
      payload_data["photo_url"] = photo_url
    }

    if (need_name != null) {
      payload_data["need_name"] = need_name
    }

    if (need_email != null) {
      payload_data["need_email"] = need_email
    }

    if (need_phone_number != null) {
      payload_data["need_phone_number"] = need_phone_number
    }

    if (need_shipping_address != null) {
      payload_data["need_shipping_address"] = need_shipping_address
    }

    if (send_phone_number_to_provider != null) {
      payload_data["send_phone_number_to_provider"] = send_phone_number_to_provider
    }

    if (send_email_to_provider != null) {
      payload_data["send_email_to_provider"] = send_email_to_provider
    }

    if (is_flexible != null) {
      payload_data["is_flexible"] = is_flexible
    }

    if (reply_markup != null) {
      payload_data["reply_markup"] = reply_markup
    }

    console.log(payload_data)

    return this.fetch({
      route: `sendInvoice`,
      payload: payload_data
    })
  }

  answerPreCheckoutQuery(ok) {
    return this.fetch({
      route: `answerPreCheckoutQuery`,
      payload: {
        pre_checkout_query_id: this.pre_checkout_query_id,
        ok
      }
    })
  }

  answerShippingQuery(ok) {
    let shipping_options = [
      {
        id: `shipping_id`,
        title: `Default Shipping`,
        prices: [
          {
            label: `Default`,
            amount: 0
          }
        ]
      }
    ]
    if (this.answer_shipping_query_reply != null) {
      shipping_options = this.answer_shipping_query_reply()
    }
    return this.fetch({
      route: `answerShippingQuery`,
      payload: {
        shipping_query_id: this.shipping_query_id,
        ok,
        shipping_options: shipping_options
      }
    })
  }

  deleteMessage(chat_id = this.getChatId()) {
    return this.fetch({
      route: `deleteMessage`,
      payload: {
        chat_id: chat_id,
        message_id: this.message_id
      }
    })
  }

  sendChatAction(action, chat_id = this.chat_id) {
    return this.fetch({
      route: `sendChatAction`,
      payload: {
        chat_id: chat_id,
        action: action
      }
    })
  }

  editMessageText({ text = this.text, reply_markup = null, parse_mode = `html` }) {
    let payload = {
      "text": text,
      "chat_id": this.chat_id,
      "message_id": this.message_id,
      parse_mode: parse_mode
    }

    if (reply_markup != null) payload["reply_markup"] = reply_markup

    return this.fetch({
      route: `editMessageText`,
      payload: payload
    })
  }

  editMessageReplyMarkup(reply_markup = null) {
    let payload = {
      chat_id: this.chat_id,
      message_id: this.message_id,
      reply_markup: reply_markup
    }

    return this.fetch({
      route: `editMessageReplyMarkup`,
      payload: payload
    })
  }

  replyDefault(text = "Hello this is default message.") {
    return this.sendMessage({ text: text })
  }

  forwardMessage({ from_chat_id = this.chat_id, chat_id }) {
    let payload = {
      from_chat_id: from_chat_id,
      chat_id: chat_id,
      message_id: this.message_id
    }

    return this.fetch({
      route: `forwardMessage`,
      payload: payload
    })
  }

  setMyCommands(commands) {
    return this.fetch({
      route: "setMyCommands",
      payload: commands
    })
  }

  setMenuButtonDefault() {
    return this.fetch({
      route: "setChatMenuButton",
      payload: {
        chat_id: this.chat_id,
        menu_button: {
          type: "default"
        }
      }
    })
  }

  setMenuButtonCommand() {
    return this.fetch({
      route: "setChatMenuButton",
      payload: {
        chat_id: this.chat_id,
        menu_button: {
          type: "commands"
        }
      }
    })
  }

  setMenuButtonWebApp(text, web_app) {
    return this.fetch({
      route: "setChatMenuButton",
      payload: {
        chat_id: this.chat_id,
        menu_button: {
          type: "web_app",
          text: text,
          web_app: {
            url: web_app
          }
        }
      }
    })
  }

  fetch({ route, payload = null }) {
    let option = {
      method: "GET",
      muteHttpExceptions: true
    }
    if (payload != null) {
      option = {
        method: "POST",
        contentType: "application/json",
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      }
    }
    let response = UrlFetchApp.fetch(
      `${this.botURL}${route}`,
      option
    ).getContentText()

    return JSON.parse(response)
  }
}

let createTelegramApp = (bot_id) => {
  return new TelegramApp(bot_id)
}

class Action {

  constructor() {
    this.TYPING = "typing"
    this.UPLOAD_PHOTO = "upload_photo"
    this.UPLOAD_VIDEO = "upload_video"
    this.UPLOAD_VOICE = "upload_voice"
    this.UPLOAD_DOCUMENT = "upload_document"
    this.CHOOSE_STICKER = "choose_sticker"
    this.FIND_LOCATION = "find_location"
    this.UPLOAD_VIDEO_NOTE = "upload_video_note"
  }
}

class MessageReply {

  static createMessageReply(message, callback) {
    return new MessageReply(message, callback)
  }

  constructor(message, callback) {
    this.message = message
    this.callback = callback
  }

  isEqualMessage(message) {
    return this.message == message || message.match(new RegExp(this.message))
  }

  run(telegram) {
    return this.callback(this, telegram)
  }
}

class BotCommand {

  static createBotCommand({ command, description = null, callback }) {
    return new BotCommand({ command, description, callback })
  }

  constructor({ command = null, description = null, callback = null }) {
    this.command = command
    this.description = description
    this.callback = callback
  }

  isEqualCommand(command) {
    return this.command === command
  }

  run(telegram) {
    return this.callback(this, telegram)
  }
}

class BotCommandList {
  constructor() {
    this.commands = []
    this.scope = {
      type: "default"
    }
  }

  defaultScope() {
    this.scope = {
      type: "default"
    }
    return this
  }

  allPrivateChatsScope() {
    this.scope = {
      type: "all_private_chats"
    }
    return this
  }

  allGroupChatsScope() {
    this.scope = {
      type: "all_group_chats"
    }
    return this
  }

  allChatAdministrators() {
    this.scope = {
      type: "all_chat_administrators"
    }
    return this
  }

  chatScope(chat_id) {
    this.scope = {
      type: "chat",
      chat_id: chat_id
    }
    return this
  }

  chatAdministrators(chat_id) {
    this.scope = {
      type: "chat_administrators",
      chat_id: chat_id
    }
    return this
  }

  chatMember(chat_id, user_id) {
    this.scope = {
      type: "chat_member",
      chat_id: chat_id,
      user_id: user_id
    }
  }

  makeBotCommand({ command = null, description = null }) {
    this.commands.push(createCommand({ command: command, description: description }))
    return this
  }

  addBotCommand(command) {
    this.commands.push(command)
    return this
  }

  clearBotCommands() {
    return {
      commands: [],
      scope: this.scope
    }
  }

  setMyCommands() {
    return {
      commands: this.commands,
      scope: this.scope
    }
  }
}

class Callback {
  static createCallback(callback, action) {
    return new Callback(callback, action)
  }

  constructor(callback, action) {
    this.callback = callback
    this.action = action
  }

  isEqualCallback(callback) {
    return this.callback === callback || callback.match(new RegExp(this.callback))
  }

  run(telegram) {
    return this.action(this, telegram)
  }
}

class WebAppReply {
  static createWebAppReply({ button_text = null, data = null, callback }) {
    return new WebAppReply(button_text, data, callback)
  }

  constructor(button_text, data, callback) {
    this.button_text = button_text
    this.data = data
    this.callback = callback
  }

  isEqualWebAppReply(button_text, data) {
    return this.button_text == button_text || this.data == data
  }

  run(telegram) {
    return this.callback(this, telegram)
  }
}

let createMessageReply = (message, callback) => {
  return MessageReply.createMessageReply(message, callback)
}

let createBotCommand = ({ command, description, callback }) => {
  return BotCommand.createBotCommand({ command, description, callback })
}

let createBotCommandList = () => {
  return new BotCommandList()
}

let createCallback = (callback, action) => {
  return Callback.createCallback(callback, action)
}

let createWebAppReply = ({ button_text = null, data = null, callback }) => {
  return WebAppReply.createWebAppReply({ button_text, data, callback })
}

class Keyboard {

  static remove() {
    return createKeyboard().remove()
  }

  constructor() {
    this.keyboard = [[]]
    this.resize_keyboard = false
    this.one_time_keyboard = false
    this.is_persistent = false
    this.input_field_placeholder = "Message"
  }

  buttons(buttons) {
    this.keyboard.push(buttons)
    return this
  }

  resize(resize) {
    this.resize_keyboard = resize
    return this
  }

  oneTime(oneTime) {
    this.one_time_keyboard = oneTime
    return this
  }

  setPersistent(is_persistent) {
    this.is_persistent = is_persistent
    return this
  }

  placeHolder(placeHolder) {
    this.input_field_placeholder = placeHolder
    return this
  }

  make(buttons) {
    this.keyboard = buttons
    return this
  }

  remove() {
    return {
      remove_keyboard: true
    }
  }

  reply() {
    return {
      keyboard: this.keyboard,
      resize_keyboard: this.resize_keyboard,
      one_time_keyboard: this.one_time_keyboard,
      input_field_placeholder: this.input_field_placeholder,
      is_persistent: this.is_persistent
    }
  }

  inline() {
    return {
      inline_keyboard: this.keyboard
    }
  }
}

class Key {
  callback(text, callback) {
    return {
      text: text,
      callback_data: callback
    }
  }

  url(text, url) {
    return {
      text: text,
      url: url
    }
  }

  webApp(text, url) {
    return {
      text: text,
      web_app: {
        url: url
      }
    }
  }
}

let createKeyboard = () => {
  return new Keyboard()
}

let createKey = () => {
  return new Key()
}

let keyCallback = (text, callback) => {
  return createKey().callback(text, callback)
}

let keyUrl = (text, url) => {
  return createKey().url(text, url)
}

let keyWebApp = (text, url) => {
  return createKey().webApp(text, url)
}

function isBotCommandMessage(message) {
  if (
    !(
      message?.hasOwnProperty("entities") &&
      message?.entities[0].type === "bot_command" &&
      /^\//.exec(message?.text)
    )
  )
    return false;
  return true;
}
