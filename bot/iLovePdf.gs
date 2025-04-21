class ILovePdf {

  static sendToTelegram(telegram, sheetName, range) {
    let iLovePdf = new ILovePdf(sheetName, range)

    let document = iLovePdf.getPDF()

    telegram.sendDocument({ documentFile: document })

    document = iLovePdf.getImage(document)

    telegram.sendDocument({ documentFile: document })

    return true
  }

  constructor(sheetName, range) {
    this.exportData = Export.getPDFDocument(sheetName, range)
    this.pdf2PNGUser = new PDF2PNGUserTable(`PDF2PNG - iLovePDF`).getRandomUser()
    this.BASE_URL = PropertiesService.getScriptProperties().getProperty(`PDF_2_PNG_BASE_URL_ILOVE_PDF`)
    this.TOOLS = `pdfjpg`

    this.UPLOAD_FILE_NAME = this.exportData.file_name + `.pdf`
    this.DOWNLOAD_FILE_NAME = this.exportData.file_name + `.png`
  }

  getPDF() {
    return this.exportData.document
  }

  getImage(document) {
    this.getAuthToken()
    this.start()
    this.uploadFile(document)
    this.process()
    let image = this.download()
    // to delete uploaded file
    this.deleteFile()
    // to delete task
    this.deleteTask()

    return image
  }

  getAuthToken() {
    let response = this.request(
      this.BASE_URL,
      "auth",
      "POST",
      null,
      {
        public_key: this.pdf2PNGUser.api_key
      }
    )

    this.TOKEN = response["token"]

    console.log(JSON.stringify(response))
  }

  start() {
    let response = this.request(
      this.BASE_URL,
      `start/${this.TOOLS}`,
      "GET",
      this.TOKEN,
      null
    )

    this.SERVER = response["server"]
    this.TASK = response["task"]

    console.log(JSON.stringify(response))
  }

  uploadFile(document) {
    let response = this.request(
      this.SERVER,
      "upload",
      "POST",
      this.TOKEN,
      {
        task: this.TASK,
        file: document
      }
    )

    this.SERVER_FILE_NAME = response["server_filename"]

    console.log(JSON.stringify(response))
  }

  deleteFile() {
    let response = this.request(
      this.SERVER,
      `upload/${this.TASK}/${this.SERVER_FILE_NAME}`,
      "DELETE",
      this.TOKEN
    )

    this.SERVER_FILE_NAME = null
    this.SERVER = null

    console.log(JSON.stringify(response))
  }

  process() {
    let response = this.request(
      this.SERVER,
      "process",
      "POST",
      this.TOKEN,
      {
        task: this.TASK,
        tool: this.TOOLS,
        files: [
          {
            server_filename: this.SERVER_FILE_NAME,
            filename: this.UPLOAD_FILE_NAME
          }
        ]
      },
      true
    )

    console.log(JSON.stringify(response))
  }

  download() {
    let document = UrlFetchApp.fetch(
      `https://${this.SERVER}/v1/download/${this.TASK}`,
      {
        headers: {
          authorization: `Bearer ${this.TOKEN}`
        }
      }
    ).getBlob().setName(this.DOWNLOAD_FILE_NAME)

    return document
  }

  deleteTask() {
    let response = this.request(
      this.BASE_URL,
      `task/${this.TASK}`,
      "DELETE",
      this.TOKEN
    )

    this.TASK = null

    console.log(JSON.stringify(response))
  }

  request(baseUrl, path, method, token = null, requestData = null, raw = false) {
    let option = {
      method,
      muteHttpExceptions: true
    }
    if (token != null) {
      option["headers"] = {
        authorization: `Bearer ${token}`
      }
    }
    if (requestData != null) {
      if (raw) {
        option["contentType"] = "application/json"
        option["payload"] = Utilities.newBlob(JSON.stringify(requestData)).getBytes()
      } else {
        option["payload"] = requestData
      }
    }
    let response = UrlFetchApp.fetch(
      `https://${baseUrl}/v1/${path}`,
      option
    )

    return JSON.parse(response.getContentText())
  }
}
