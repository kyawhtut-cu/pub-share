class Nutrient {

  static sendToTelegram(telegram, sheetName, range) {
    let nutrient = new Nutrient(sheetName, range)

    let document = nutrient.getPDF()

    telegram.sendDocument({ documentFile: document })

    document = nutrient.getImage(document)

    if (document == null) {
      return false
    }

    telegram.sendDocument({ documentFile: document })

    return true
  }

  constructor(sheetName, range) {
    this.exportData = Export.getPDFDocument(sheetName, range)
    this.pdf2PNGUser = new PDF2PNGUserTable(`PDF2PNG - Nutrient`).getRandomUser()
  }

  getPDF() {
    return this.exportData.document
  }

  getImage(document) {
    let formData = {
      "instructions": {
        "parts": [
          {
            "file": "document"
          }
        ],
        "output": {
          "type": "image",
          "format": "png",
          "dpi": 500
        }
      }
    }

    formData["document"] = document
    formData.instructions = JSON.stringify(formData.instructions)

    const pdf2PNGResponse = UrlFetchApp.fetch(
      PropertiesService.getScriptProperties().getProperty(`PDF_2_PNG_BASE_URL_NUTRIENT`),
      {
        headers: {
          authorization: `Bearer ${this.pdf2PNGUser.api_key}`
        },
        method: "POST",
        payload: formData,
        muteHttpExceptions: true
      }
    )

    let isSuccess = false
    try {
      JSON.parse(pdf2PNGResponse.getContentText())
      isSuccess = false
    } catch (err) {
      isSuccess = true
    }

    if (!isSuccess) {
      return null
    }

    return pdf2PNGResponse.getBlob().setName(`${this.exportData.file_name}.png`)
  }
}
