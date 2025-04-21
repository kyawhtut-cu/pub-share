let testTelegram = (data) => {
  Tamotsu.initialize()

  let telegramController = new TelegramController({
    postData: {
      contents: JSON.stringify(data)
    }
  })
  telegramController.setDebug(true)

  // generateForTelegramUser(telegramController.Telegram, telegramController.Telegram.chat_id, {
  //   pub_date: '2024-04-28T06:32:55.817Z',
  //   pub_amount: 1,
  //   internet_amount: '1',
  //   postal_code: '730863',
  //   unit_number: '13',
  //   long_term_list:
  //     [
  //       { no: '1', name: 'Name One' },
  //       { no: '2', name: 'Name Two' },
  //       { no: '3', name: 'Name Three' },
  //       { no: '4', name: 'Name Four' },
  //       { no: '5', name: 'Name Five' },
  //       { no: '6', name: 'Name Six' }
  //     ],
  //   short_term_list:
  //     [
  //       {
  //         no: '1',
  //         name: 'Short Term One',
  //         date: '01-04-2024\n02-04-2024'
  //       },
  //       {
  //         no: '2',
  //         name: 'Short Term Two',
  //         date: '01-04-2024\n02-04-2024'
  //       }
  //     ]
  // })

  telegramController.run()

}

let testTelegramCommand = () => {
  let command = `/generate`
  testTelegram({
    "update_id": 615665528,
    "message": {
      "message_id": 213,
      "from": {
        "id": 5440573899,
        "is_bot": false,
        "first_name": "Kyaw",
        "last_name": "Htut",
        "username": "kyawhtut",
        "language_code": "en"
      },
      "chat": {
        "id": 5440573899,
        "first_name": "Kyaw",
        "last_name": "Htut",
        "username": "kyawhtut",
        "type": "private"
      },
      "date": 1691513049,
      "text": command,
      "entities": [
        {
          "offset": 0,
          "length": 6,
          "type": "bot_command"
        }
      ]
    }
  })
}

let testTelegramCallbak = () => {
  testTelegram({
    "update_id": 941708346,
    "callback_query": {
      "id": "4920342896739063873",
      "from": {
        "id": 5440573899,
        "is_bot": false,
        "first_name": "Kyaw",
        "last_name": "Htut",
        "username": "kyawhtut",
        "language_code": "en"
      },
      "message": {
        "message_id": 4,
        "from": {
          "id": 6830562235,
          "is_bot": true,
          "first_name": "PUB Share - SG",
          "username": "pub_share_sg_bot"
        },
        "chat": {
          "id": 5440573899,
          "first_name": "Kyaw",
          "last_name": "Htut",
          "username": "kyawhtut",
          "type": "private"
        },
        "date": 1714218069,
        "text": "အကောင့်ဖွင့်ဖို့ သဘောတူပါသလား။ အကောင့် ဖွင့်ဖွင့်ချင်း Credit ၁ ခုရရှိပါမည်။",
        "reply_markup": {
          "inline_keyboard": [
            [
              {
                "text": "သဘောတူပါသည်။",
                "callback_data": "agree_to_open_account"
              }
            ]
          ]
        }
      },
      "chat_instance": "-8714268493917775648",
      "data": "agree_to_open_account"
    }
  })
}

let testTelegramWebApp = () => {
  testTelegram({
    update_id: 941708366,
    message:
    {
      message_id: 53,
      from:
      {
        id: 5440573899,
        is_bot: false,
        first_name: 'Kyaw',
        last_name: 'Htut',
        username: 'kyawhtut',
        language_code: 'en'
      },
      chat:
      {
        id: 5440573899,
        first_name: 'Kyaw',
        last_name: 'Htut',
        username: 'kyawhtut',
        type: 'private'
      },
      date: 1714299608,
      web_app_data:
      {
        button_text: 'Continue',
        data: '{"pub_date":"2024-04-28T10:17:44.243Z","pub_amount":240,"internet_amount":46,"postal_code":"730863","unit_number":"03-194","long_term_list":[{"no":"1","name":"Name One"},{"no":"2","name":"Name Two"},{"no":"3","name":"Name Three"},{"no":"4","name":"Name Four"},{"no":"5","name":"Name Five"},{"no":"6","name":"Name Six"}],"short_term_list":[{"no":"1","name":"Name One","date":"01-04-2024\\n02-04-2024"},{"no":"2","name":"Name Two","date":"01-04-2024\\n02-04-2024"},{"no":"3","name":"Name Three","date":"14-04-2024\\n30-04-2024"},{"no":"4","name":"Name Four","date":"14-04-2024\\n30-04-2024"}]}'
      }
    }
  })
}

let test = () => {
  let data = { "queryString": "", "contentLength": 1054, "parameters": {}, "postData": { "contents": "{\"update_id\":941708366,\n\"message\":{\"message_id\":53,\"from\":{\"id\":5440573899,\"is_bot\":false,\"first_name\":\"Kyaw\",\"last_name\":\"Htut\",\"username\":\"kyawhtut\",\"language_code\":\"en\"},\"chat\":{\"id\":5440573899,\"first_name\":\"Kyaw\",\"last_name\":\"Htut\",\"username\":\"kyawhtut\",\"type\":\"private\"},\"date\":1714299608,\"web_app_data\":{\"button_text\":\"Generate\",\"data\":\"{\\\"pub_date\\\":\\\"2024-04-28T10:17:44.243Z\\\",\\\"pub_amount\\\":240,\\\"internet_amount\\\":46,\\\"postal_code\\\":\\\"730863\\\",\\\"unit_number\\\":\\\"03-194\\\",\\\"long_term_list\\\":[{\\\"no\\\":\\\"1\\\",\\\"name\\\":\\\"Name One\\\"},{\\\"no\\\":\\\"2\\\",\\\"name\\\":\\\"Name Two\\\"},{\\\"no\\\":\\\"3\\\",\\\"name\\\":\\\"Name Three\\\"},{\\\"no\\\":\\\"4\\\",\\\"name\\\":\\\"Name Four\\\"},{\\\"no\\\":\\\"5\\\",\\\"name\\\":\\\"Name Five\\\"},{\\\"no\\\":\\\"6\\\",\\\"name\\\":\\\"Name Six\\\"}],\\\"short_term_list\\\":[{\\\"no\\\":\\\"1\\\",\\\"name\\\":\\\"Name One\\\",\\\"date\\\":\\\"01/04/2024\\\\n02/04/2024\\\"},{\\\"no\\\":\\\"2\\\",\\\"name\\\":\\\"Name Two\\\",\\\"date\\\":\\\"01/04/2024\\\\n02/04/2024\\\"},{\\\"no\\\":\\\"3\\\",\\\"name\\\":\\\"Name Three\\\",\\\"date\\\":\\\"14/04/2024\\\\n29/04/2024\\\"},{\\\"no\\\":\\\"4\\\",\\\"name\\\":\\\"Name Four\\\",\\\"date\\\":\\\"14/04/2024\\\\n29/04/2024\\\"}]}\"}}}", "length": 1054, "name": "postData", "type": "application/json" }, "contextPath": "", "parameter": {} }
  let webAppData = JSON.parse(data.postData.contents)
  console.log(webAppData)
}
