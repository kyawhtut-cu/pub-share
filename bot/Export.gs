function sendImageToTelegram(telegram, sheetName, range, data) {
  var sheet = SpreadsheetApp.openById(
    PropertiesService.getScriptProperties().getProperty("SPREAD_SHEET_ID")
  ).getSheetByName(sheetName)
  sheet.getRange(range).activate()

  var file_name = sheet.getName().split("~")[0]
  var url = generatePDFExportURL(sheet)

  var pdf = UrlFetchApp.fetch(
    url,
    {
      headers: {
        authorization: "Bearer " + ScriptApp.getOAuthToken()
      }
    }
  ).getBlob().setName(`${file_name}.pdf`)

  telegram.sendDocument({ documentFile: pdf })

  var formData = {
    "instructions": JSON.stringify({
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
    }),
    document: pdf
  }

  let pdf2PNGUser = new PDF2PNGUserTable().getRandomUser()

  const pdf2PNGResponse = UrlFetchApp.fetch(
    PropertiesService.getScriptProperties().getProperty(`PDF_2_PNG_BASE_URL`),
    {
      headers: {
        authorization: `Bearer ${pdf2PNGUser.api_key}`
      },
      method: "POST",
      payload: formData,
      muteHttpExceptions: true
    }
  )

  let isSuccess = false
  try {
    let jsonResponse = JSON.parse(pdf2PNGResponse.getContentText())
    console.log(jsonResponse)
    isSuccess = false
  } catch (err) {
    isSuccess = true
  }

  if (!isSuccess) {
    new UserTable().setGenerateData(telegram.chat_id, JSON.stringify(data))
    new UserTable().updateUserCredit(telegram.chat_id, 1)
    telegram.sendMessage({
      text: `PDF to PNG လုပ်ဆောင်မှုတွင် အနည်းငယ်ပြဿနာ တက်သွားပါသဖြင့် Admin Team မှ မကြာခင် အမြန်ဆုံး ဖြေရှင်းပေးပါလိမ့်မည်။\nSystem ချို့ယွင်းမှု ဖြစ်ပေါ်လာသည့်အတွက် ယခုလုပ်ဆောင်မှု အတွက် သင့်၏ Credit ထဲမှ နှုတ်ယူထားခြင်းမရှိပါ။`
    })
  } else {
    response = telegram.sendDocument({ documentFile: pdf2PNGResponse.getBlob().setName(`${file_name}.png`) })
  }

  SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty("SPREAD_SHEET_ID")).deleteSheet(
    SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty("SPREAD_SHEET_ID")).getSheetByName(sheetName)
  )
}

function saveImageToGoogleDrive(sheetName, range) {
  var sheet = SpreadsheetApp.openById(
    PropertiesService.getScriptProperties().getProperty("SPREAD_SHEET_ID")
  ).getSheetByName(sheetName)
  sheet.getRange(range).activate()

  var file_name = sheet.getName()
  var url = generatePDFExportURL(sheet)

  var blob = UrlFetchApp.fetch(
    url,
    {
      headers: {
        authorization: "Bearer " + ScriptApp.getOAuthToken()
      }
    }
  ).getBlob().setName(`${file_name}.pdf`)

  var formData = {
    "instructions": JSON.stringify({
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
    }),
    document: blob
  }

  let pdf2PNGUser = new PDF2PNGUserTable().getRandomUser()

  var image = UrlFetchApp.fetch(
    PropertiesService.getScriptProperties().getProperty(`PDF_2_PNG_BASE_URL`),
    {
      headers: {
        authorization: `Bearer ${pdf2PNGUser.api_key}`
      },
      method: "POST",
      payload: formData,
      muteHttpExceptions: true
    }
  ).getBlob().setName(`${file_name}.png`)

  const folderId = PropertiesService.getScriptProperties().getProperty(`DRIVE_FOLDER_ID`)
  const folder = DriveApp.getFolderById(folderId)
  folder.createFile(image)
}

//   _____    _  __ 
//  |  __ \  | |/ _|
//  | |__) |_| | |_ 
//  |  ___/ _` |  _|
//  | |  | (_| | |  
//  |_|   \__,_|_|  
/**
 * converts range to Url
 * ready to be saved as PDF
 * 
 * More info here:
 * https://stackoverflow.com/questions/46088042
 * https://gist.github.com/Spencer-Easton/78f9867a691e549c9c70
 * https://kandiral.ru/googlescript/eksport_tablic_google_sheets_v_pdf_fajl.html
 * 
 * @param {int} options.size_limit    1100 rows/columns (in tests)
 * @param {int} options.measure_limit 150 rows/columns
 */
function generatePDFExportURL(sheet) {
  var ratio = 96; // get inch from pixel
  let size_limit = 1100
  let measure_limit = 150
  let spreadsheet = SpreadsheetApp.getActive()

  let range = sheet.getActiveRange()

  var rownum = range.getRow()
  var columnnum = range.getColumn()
  var rownum2 = range.getLastRow()
  var columnnum2 = range.getLastColumn()

  if ((rownum2 - rownum + 1) > size_limit) {
    throw `😢The range exceeded the limit of ${size_limit} ${rows}`
  }
  if ((columnnum2 - columnnum + 1) > size_limit) {
    throw `😢The range exceeded the limit of ${size_limit} ${columns}`
  }

  spreadsheet.toast(`Please wait...`, `📐Measuring Range...`)

  // get width in pixels 
  var w = 0, size;
  for (var i = columnnum; i <= columnnum2; i++) {
    if (i <= measure_limit) {
      size = sheet.getColumnWidth(i)
    }
    w += size
    if ((i % 50) === 0 && i <= measure_limit) {
      spreadsheet.toast(
        `Done ${i} + columns of ${columnnum2}`,
        `↔📐Measuring width...`
      )
    }
  }
  if (i > measure_limit) {
    spreadsheet.toast(
      `Estimation: all other columns are the same size`,
      `↔📐Measuring width...`
    )
  }

  // get row height in pixels
  var h = 0;
  for (var i = rownum; i <= rownum2; i++) {
    if (i <= measure_limit) {
      size = sheet.getRowHeight(i)
    }
    h += size
    /** manual correction */
    if (size === 2) {
      h -= 1
    } else {
      // h -= 0.42; /** TODO → test the range to make it fit any range */
    }

    if ((i % 50) === 0 && i <= measure_limit) {
      spreadsheet.toast(
        `Done ${i} rows of ${rownum2}`,
        `↕📐Measuring height...`
      )
    }
  }
  if (i > measure_limit) {
    spreadsheet.toast(
      `Estimation: all other rows are the same size`,
      `↕📐Measuring height...`
    )
  }

  // add 0.1 inch to fit some ranges
  var hh = Math.round(h / ratio * 1000 + 100) / 1000
  var ww = Math.round(w / ratio * 1000 + 100) / 1000

  var sets = {
    url: spreadsheet.getUrl(),
    sheetId: sheet.getSheetId(),
    r1: rownum - 1,
    r2: rownum2,
    c1: columnnum - 1,
    c2: columnnum2,
    size: ww + 'x' + hh,          //A3/A4/A5/B4/B5/letter/tabloid/legal/statement/executive/folio
    // portrait: true,       //true= Potrait / false= Landscape
    scale: 2,          //1= Normal 100% / 2= Fit to width / 3= Fit to height / 4= Fit to Page
    top_margin: 0,     //All four margins must be set!        
    bottom_margin: 0,  //All four margins must be set!       
    left_margin: 0,    //All four margins must be set!         
    right_margin: 0,   //All four margins must be set!
  }
  var rangeParam = `&r1=${sets.r1}&r2=${sets.r2}&c1=${sets.c1}&c2=${sets.c2}`
  var sheetParam = `&gid=${sets.sheetId}`
  var isPortrait = '';
  if (sets.portrait) {
    //true= Potrait / false= Landscape
    isPortrait = `&portrait=${sets.portrait}`
  }
  var exportUrl = sets.url.replace(/\/edit.*$/, '')
    + '/export?exportFormat=pdf&format=pdf'
    + '&size=' + sets.size             //A3/A4/A5/B4/B5/letter/tabloid/legal/statement/executive/folio
    + isPortrait
    + '&scale=' + sets.scale            //1= Normal 100% / 2= Fit to width / 3= Fit to height / 4= Fit to Page     
    + '&top_margin=' + sets.top_margin       //All four margins must be set!       
    + '&bottom_margin=' + sets.bottom_margin    //All four margins must be set!     
    + '&left_margin=' + sets.left_margin      //All four margins must be set! 
    + '&right_margin=' + sets.right_margin     //All four margins must be set!     
    + '&sheetnames=false&printtitle=false'
    + '&pagenum=UNDEFINED' // change it to CENTER to print page numbers
    + '&horizontal_alignment=LEFT' // //LEFT/CENTER/RIGHT
    + '&gridlines=false'
    + "&fmcmd=12"
    + '&fzr=FALSE'
    + sheetParam
    + rangeParam;

  return exportUrl;
}
