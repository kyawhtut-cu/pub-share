function generateForTelegramUser(telegram, userId, data) {

  let sheetName = `${stringToDate(data.pub_start_date, "dd-mm-yyyy", `-`).toLocaleDateString(
    `en-GB`,
    {
      day: `2-digit`, month: `long`, year: `numeric`
    }
  )} - ${stringToDate(data.pub_end_date, "dd-mm-yyyy", `-`).toLocaleDateString(
    `en-GB`,
    {
      day: `2-digit`, month: `long`, year: `numeric`
    }
  )}`

  let user = new UserTable().getUserById(userId)
  sheetName += `~[${user.user_name}]`

  if (SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty("SPREAD_SHEET_ID")).getSheetByName(sheetName) == null) {
    let sheet = SpreadsheetApp.getActive().insertSheet()
    sheet.setName(sheetName)
    sheet.setHiddenGridlines(true)
  }

  let range = generateTemplate(sheetName, data)

  // nutrient, iLovePdf
  let type = `nutrient`
  if (user.credit >= 0) {
    type = `iLovePdf`
  }
  Export.sendToTelegram(telegram, type, sheetName, range, data)
}

function testTemplate(telegram) {
  Tamotsu.initialize()

  let data = {
    generate_title: 'April 2024',
    pub_start_date: `20-02-2025`,
    pub_end_date: `19-03-2025`,
    pub_amount: 1,
    internet_amount: 1,
    postal_code: '730863',
    unit_number: '13',
    long_term_list:
      [
        { no: '1', name: 'Name One' },
        { no: '2', name: 'Name Two' },
        { no: '3', name: 'Name Three' },
        { no: '4', name: 'Name Four' },
        { no: '5', name: 'Name Five' },
        { no: '6', name: 'Name Six' }
      ],
    short_term_list:
      [
        // {
        //   no: '1',
        //   name: 'Short Term One',
        //   date: '01-04-2024\n02-04-2024'
        // },
        // {
        //   no: '2',
        //   name: 'Short Term Two',
        //   date: '01-04-2024\n02-04-2024'
        // }
      ]
  }

  let sheetName = `${stringToDate(data.pub_start_date, "dd-mm-yyyy", `-`).toLocaleDateString(
    `en-GB`,
    {
      day: `2-digit`, month: `long`, year: `numeric`
    }
  )} - ${stringToDate(data.pub_end_date, "dd-mm-yyyy", `-`).toLocaleDateString(
    `en-GB`,
    {
      day: `2-digit`, month: `long`, year: `numeric`
    }
  )}~[UserName]`

  if (SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty("SPREAD_SHEET_ID")).getSheetByName(sheetName) == null) {
    let sheet = SpreadsheetApp.getActive().insertSheet()
    sheet.setName(sheetName)
    sheet.setHiddenGridlines(true)
  }

  let range = generateTemplate(
    sheetName,
    data
  )

  // nutrient, iLovePdf
  Export.sendToTelegram(telegram, `iLovePdf`, sheetName, range, data)
}

function generateTemplate(sheetName, data) {
  let sheetId = PropertiesService.getScriptProperties().getProperty("SPREAD_SHEET_ID")
  let templateSheet = SpreadsheetApp.openById(sheetId).getSheetByName("TelegramTemplate")
  let copySheet = SpreadsheetApp.openById(sheetId).getSheetByName(sheetName)

  let totalDay = 10
  if (sheetName.toLowerCase() != "Template".toLowerCase()) {
    totalDay = dateRange(data.pub_start_date, data.pub_end_date).length
  }

  let longTermList = data.long_term_list ?? []
  let shortTermList = data.short_term_list ?? []

  let total = parseFloat(data.pub_amount) + parseFloat(data.internet_amount)
  let numberOfPpl = longTermList.length + shortTermList.length
  let perPaxFee = total / (numberOfPpl * totalDay)
  let shortTermTotalFee = 0
  let totalDayOfShortTerm = shortTermList.map(ppl => {
    let day = dateRange(ppl.date.split("\n")[0], ppl.date.split("\n")[1])
    shortTermTotalFee += day.length * perPaxFee
    return day
  }).flatMap((arr) => arr.map(date => date.getTime())).filter((date, index, array) => array.indexOf(date) === index).length
  let longTermFee = (total - shortTermTotalFee) / (totalDay * longTermList.length)

  // setting column width
  settingSheetColumn(templateSheet, copySheet)

  // setting row height
  settingSheetRow(templateSheet, copySheet)

  // display title
  displayTitleForGenerateMonth(
    copySheet,
    data.generate_title,
    `PUB Calculate from ${stringToDate(data.pub_start_date, "dd-mm-yyyy", `-`).toLocaleDateString(
      `en-GB`,
      {
        day: `2-digit`, month: `long`, year: `numeric`
      }
    )} to ${stringToDate(data.pub_end_date, "dd-mm-yyyy", `-`).toLocaleDateString(
      `en-GB`,
      {
        day: `2-digit`, month: `long`, year: `numeric`
      }
    )}`
  )

  // display right top summary
  displayRightTopSummary(
    copySheet,
    positionStart = 3,
    [
      {
        label: "No. PPL:",
        value: numberOfPpl
      },
      {
        label: "Total Day:",
        value: totalDay
      },
      {
        label: "Unit Number:",
        value: `#${data.unit_number}`
      },
      {
        label: "Date:",
        value: new Date()
      },
      {
        label: "Postal Code:",
        value: data.postal_code
      }
    ]
  )

  // display fee summary
  displayFeeSummary(copySheet, data.generate_title, data.pub_amount, data.internet_amount)

  // display summary
  displaySummary(copySheet, perPaxFee, longTermList.length, shortTermList.length)

  // display summary amount
  displayAmmountSummary(copySheet, longTermFee, perPaxFee, totalDayOfShortTerm)

  // display long term ppl
  let lastPositionForLongTerm = 18
  if (longTermList.length > 0) {
    lastPositionForLongTerm = displayLongTermPpl(
      copySheet,
      longTermList,
      longTermFee * totalDay
    )
  }

  // display short term ppl
  let lastPositionForShortTerm = 18
  if (shortTermList.length > 0) {
    lastPositionForShortTerm = displayShortTermPpl(
      copySheet,
      shortTermList,
      perPaxFee
    )
  }

  let lastRange = lastPositionForLongTerm

  if (lastPositionForShortTerm > lastPositionForLongTerm) {
    lastRange = lastPositionForShortTerm
  }

  // display watermark
  displayWaterMark(copySheet, lastRange - 1)

  return `B2:U${lastRange}`
}

function settingSheetColumn(original, copySheet) {
  for (let index = 1; index < 23; index += 1) {
    copySheet.setColumnWidth(index, original.getColumnWidth(index))
  }
}

function settingSheetRow(original, copySheet) {
  for (let index = 1; index < 50; index += 1) {
    copySheet.setRowHeight(index, original.getRowHeight(index))
  }
}

function displayTitleForGenerateMonth(sheet, header, pubCalculateDate) {
  let titleCell = sheet.getRange(`C3:O6`)
  titleCell.merge()
  titleCell.setVerticalAlignment(ALIGN_MIDDLE)
  titleCell.setFontWeight(FONT_STYLE_BOLD)
  titleCell.setFontSize(46)
  titleCell.setFontFamily(FONT_GEORGIA)
  titleCell.setValue(`PUB for ${header}`)

  titleCell = sheet.getRange(`C7:O7`)
  titleCell.merge()
  titleCell.setVerticalAlignment(ALIGN_MIDDLE)
  titleCell.setFontWeight(FONT_STYLE_BOLD)
  titleCell.setFontSize(12)
  titleCell.setFontFamily(FONT_MONTSERRAT)
  titleCell.setValue(pubCalculateDate)
}

function displayRightTopSummary(sheet, positionStart, displayData) {
  displayData.forEach(data => {
    let cell = sheet.getRange(`R${positionStart}:S${positionStart}`)
    cell.merge()
    cell.setVerticalAlignment(ALIGN_MIDDLE)
    cell.setHorizontalAlignment(ALIGN_RIGHT)
    cell.setFontFamily(FONT_MONTSERRAT)
    cell.setValue(data.label)

    cell = sheet.getRange(`T${positionStart}`)
    cell.setVerticalAlignment(ALIGN_MIDDLE)
    cell.setHorizontalAlignment(ALIGN_RIGHT)
    cell.setFontFamily(FONT_MONTSERRAT)
    cell.setFontWeight(FONT_STYLE_BOLD)
    if (data.value instanceof Date) {
      cell.setNumberFormat("dd-MM-yyyy")
    }
    cell.setValue(data.value)
    positionStart += 1
  })
}

function displayFeeSummary(sheet, header, pubFee, internetFee) {
  let positionStart = 10
  let cell = sheet.getRange(`C${positionStart}:H${positionStart}`)
  cell.merge()
  cell.setBackground("#e7edf4")
  cell.setFontColor("#889daa")
  cell.setFontFamily(FONT_GEORGIA)
  cell.setFontWeight(FONT_STYLE_BOLD)
  cell.setFontSize(24)
  cell.setHorizontalAlignment(ALIGN_CENTER)
  cell.setVerticalAlignment(ALIGN_MIDDLE)
  cell.setBorder(true, true, true, true, true, true, DEFAULT_BORDER_COLOR, SpreadsheetApp.BorderStyle.SOLID)
  cell.setValue(header)

  positionStart += 1
  cell = sheet.getRange(`C${positionStart}:H${positionStart}`)
  cell.merge()
  cell.setBorder(false, true, false, true, false, false, DEFAULT_BORDER_COLOR, SpreadsheetApp.BorderStyle.SOLID)

  let feeList = [
    {
      label: "PUB",
      value: pubFee
    },
    {
      label: "Internet",
      value: internetFee
    },
    {
      label: "TOTAL",
      value: pubFee + internetFee
    }
  ]
  positionStart += 1
  feeList.forEach(fee => {
    let cell = sheet.getRange(`C${positionStart}:D${positionStart}`)
    cell.merge()
    cell.setBorder(false, true, false, false, false, false, DEFAULT_BORDER_COLOR, SpreadsheetApp.BorderStyle.SOLID)
    cell.setHorizontalAlignment(ALIGN_RIGHT)
    cell.setVerticalAlignment(ALIGN_MIDDLE)
    cell.setFontWeight(FONT_STYLE_BOLD)
    cell.setFontColor("#3e6074")
    cell.setFontFamily(FONT_MONTSERRAT)
    cell.setValue(fee.label)

    cell = sheet.getRange(`E${positionStart}`)
    cell.setBorder(false, false, false, false, false, false, DEFAULT_BORDER_COLOR, SpreadsheetApp.BorderStyle.SOLID)
    cell.setHorizontalAlignment(ALIGN_RIGHT)
    cell.setVerticalAlignment(ALIGN_MIDDLE)
    cell.setFontWeight(FONT_STYLE_BOLD)
    cell.setFontColor("#3e6074")
    cell.setFontFamily(FONT_MONTSERRAT)
    cell.setNumberFormat("#,##0.00")
    cell.setValue(fee.value)

    cell = sheet.getRange(`F${positionStart}:H${positionStart}`)
    cell.merge()
    cell.setBorder(false, false, false, true, false, false, DEFAULT_BORDER_COLOR, SpreadsheetApp.BorderStyle.SOLID)

    positionStart += 1
  })

  cell = sheet.getRange(`C${positionStart}:H${positionStart}`)
  cell.merge()
  cell.setBorder(false, true, true, true, false, true, DEFAULT_BORDER_COLOR, SpreadsheetApp.BorderStyle.SOLID)
}

function displaySummary(sheet, feePaxPerDay, totalLongTermPpl, totalShortTermPpl) {
  let positionStart = 10
  let cell = sheet.getRange(`J${positionStart}:O${positionStart}`)
  cell.merge()
  cell.setHorizontalAlignment(ALIGN_CENTER)
  cell.setVerticalAlignment(ALIGN_MIDDLE)
  cell.setFontWeight(FONT_STYLE_BOLD)
  cell.setFontColor("#c77780")
  cell.setBackground("#f5e8ea")
  cell.setFontFamily(FONT_GEORGIA)
  cell.setFontSize(24)
  cell.setBorder(true, true, true, true, false, true, DEFAULT_BORDER_COLOR, SpreadsheetApp.BorderStyle.SOLID)
  cell.setValue("SUMMARY")

  positionStart += 1
  cell = sheet.getRange(`J${positionStart}:O${positionStart}`)
  cell.merge()
  cell.setBorder(false, true, false, true, false, false, DEFAULT_BORDER_COLOR, SpreadsheetApp.BorderStyle.SOLID)

  let summaryList = [
    {
      label: "1 Pax / day",
      value: feePaxPerDay.toFixed(2)
    },
    {
      label: "No. PPL (Long-Term)",
      value: totalLongTermPpl
    },
    {
      label: "No. PPL (Short-Term)",
      value: totalShortTermPpl
    }
  ]
  positionStart += 1
  summaryList.forEach(summary => {
    let cell = sheet.getRange(`J${positionStart}:K${positionStart}`)
    cell.merge()
    cell.setHorizontalAlignment(ALIGN_RIGHT)
    cell.setVerticalAlignment(ALIGN_MIDDLE)
    cell.setFontFamily(FONT_MONTSERRAT)
    cell.setBorder(false, true, false, false, false, false, DEFAULT_BORDER_COLOR, SpreadsheetApp.BorderStyle.SOLID)
    cell.setValue(summary.label)

    cell = sheet.getRange(`L${positionStart}`)
    cell.setHorizontalAlignment(ALIGN_RIGHT)
    cell.setVerticalAlignment(ALIGN_MIDDLE)
    cell.setFontFamily(FONT_MONTSERRAT)
    cell.setFontWeight(FONT_STYLE_BOLD)
    cell.setBorder(false, false, false, false, false, false, DEFAULT_BORDER_COLOR, SpreadsheetApp.BorderStyle.SOLID)
    cell.setNumberFormat("@")
    cell.setValue(`${summary.value}`)

    cell = sheet.getRange(`M${positionStart}:O${positionStart}`)
    cell.merge()
    cell.setBorder(false, false, false, true, false, false, DEFAULT_BORDER_COLOR, SpreadsheetApp.BorderStyle.SOLID)

    positionStart += 1
  })

  cell = sheet.getRange(`J${positionStart}:O${positionStart}`)
  cell.merge()
  cell.setBorder(false, true, true, true, true, false, DEFAULT_BORDER_COLOR, SpreadsheetApp.BorderStyle.SOLID)
}

function displayAmmountSummary(sheet, longTermFee, shortTermFee, totalShortTermDay) {
  let positionStart = 10
  let cell = sheet.getRange(`Q${positionStart}:T${positionStart}`)
  cell.merge()
  cell.setHorizontalAlignment(ALIGN_CENTER)
  cell.setVerticalAlignment(ALIGN_MIDDLE)
  cell.setBackground("#f5e8ea")
  cell.setFontColor("#c77780")
  cell.setFontWeight(FONT_STYLE_BOLD)
  cell.setFontSize(24)
  cell.setFontFamily(FONT_GEORGIA)
  cell.setBorder(true, true, true, true, false, false, DEFAULT_BORDER_COLOR, SpreadsheetApp.BorderStyle.SOLID)
  cell.setValue("Amount Summary")

  positionStart += 1
  cell = sheet.getRange(`Q${positionStart}:T${positionStart}`)
  cell.merge()
  cell.setBorder(false, true, false, true, false, false, DEFAULT_BORDER_COLOR, SpreadsheetApp.BorderStyle.SOLID)

  let summaryList = [
    {
      label: "Long-Term 1 Pax / day",
      value: longTermFee.toFixed(2)
    },
    {
      label: "Short-Term 1 Pax / day",
      value: shortTermFee.toFixed(2)
    },
    {
      label: "Total Short-Term Day",
      value: totalShortTermDay
    }
  ]
  positionStart += 1
  summaryList.forEach(summary => {
    let cell = sheet.getRange(`Q${positionStart}:R${positionStart}`)
    cell.merge()
    cell.setHorizontalAlignment(ALIGN_RIGHT)
    cell.setVerticalAlignment(ALIGN_MIDDLE)
    cell.setFontFamily(FONT_MONTSERRAT)
    cell.setBorder(false, true, false, false, false, false, DEFAULT_BORDER_COLOR, SpreadsheetApp.BorderStyle.SOLID)
    cell.setValue(summary.label)

    cell = sheet.getRange(`S${positionStart}`)
    cell.setHorizontalAlignment(ALIGN_RIGHT)
    cell.setVerticalAlignment(ALIGN_MIDDLE)
    cell.setFontFamily(FONT_MONTSERRAT)
    cell.setNumberFormat("@")
    cell.setFontWeight(FONT_STYLE_BOLD)
    cell.setValue(summary.value)

    cell = sheet.getRange(`T${positionStart}`)
    cell.setBorder(false, false, false, true, false, false, DEFAULT_BORDER_COLOR, SpreadsheetApp.BorderStyle.SOLID)

    positionStart += 1
  })

  cell = sheet.getRange(`Q${positionStart}:T${positionStart}`)
  cell.merge()
  cell.setBorder(false, true, true, true, false, false, DEFAULT_BORDER_COLOR, SpreadsheetApp.BorderStyle.SOLID)
}

function displayLongTermPpl(sheet, peopleList, fee) {
  let positionStart = 17
  let cell = sheet.getRange(`C${positionStart}:H${positionStart}`)
  cell.merge()
  cell.setHorizontalAlignment(ALIGN_CENTER)
  cell.setVerticalAlignment(ALIGN_MIDDLE)
  cell.setBackground(DEFAULT_BORDER_COLOR)
  cell.setFontColor("#889caa")
  cell.setFontWeight(FONT_STYLE_BOLD)
  cell.setFontFamily(FONT_GEORGIA)
  cell.setFontSize(24)
  cell.setBorder(true, true, true, true, false, false, DEFAULT_BORDER_COLOR, SpreadsheetApp.BorderStyle.SOLID)
  cell.setValue("Long-Term")

  positionStart += 1
  cell = sheet.getRange(`C${positionStart}:H${positionStart}`)
  cell.setBackground("#889caa")

  cell = sheet.getRange(`C${positionStart}`)
  cell.setFontColor("white")
  cell.setHorizontalAlignment(ALIGN_CENTER)
  cell.setVerticalAlignment(ALIGN_MIDDLE)
  cell.setFontWeight(FONT_STYLE_BOLD)
  cell.setFontFamily(FONT_MONTSERRAT)
  cell.setBorder(true, true, true, true, false, false, DEFAULT_BORDER_COLOR, SpreadsheetApp.BorderStyle.SOLID)
  cell.setValue("No.")

  cell = sheet.getRange(`D${positionStart}:F${positionStart}`)
  cell.merge()
  cell.setFontColor("white")
  cell.setHorizontalAlignment(ALIGN_CENTER)
  cell.setVerticalAlignment(ALIGN_MIDDLE)
  cell.setFontWeight(FONT_STYLE_BOLD)
  cell.setFontFamily(FONT_MONTSERRAT)
  cell.setBorder(true, true, true, true, false, false, DEFAULT_BORDER_COLOR, SpreadsheetApp.BorderStyle.SOLID)
  cell.setValue("Name")

  cell = sheet.getRange(`G${positionStart}:H${positionStart}`)
  cell.merge()
  cell.setFontColor("white")
  cell.setHorizontalAlignment(ALIGN_CENTER)
  cell.setVerticalAlignment(ALIGN_MIDDLE)
  cell.setFontWeight(FONT_STYLE_BOLD)
  cell.setFontFamily(FONT_MONTSERRAT)
  cell.setBorder(true, true, true, true, false, false, DEFAULT_BORDER_COLOR, SpreadsheetApp.BorderStyle.SOLID)
  cell.setValue("Amount")

  positionStart += 1
  peopleList.forEach((people, index) => {
    let cell = sheet.getRange(`C${positionStart}`)
    cell.setHorizontalAlignment(ALIGN_CENTER)
    cell.setVerticalAlignment(ALIGN_MIDDLE)
    cell.setFontFamily(FONT_MONTSERRAT)
    cell.setBorder(true, true, true, true, false, false, DEFAULT_BORDER_COLOR, SpreadsheetApp.BorderStyle.SOLID)
    cell.setValue(index + 1)

    cell = sheet.getRange(`D${positionStart}:F${positionStart}`)
    cell.merge()
    cell.setHorizontalAlignment(ALIGN_LEFT)
    cell.setVerticalAlignment(ALIGN_MIDDLE)
    cell.setFontFamily(FONT_MONTSERRAT)
    cell.setBorder(true, true, true, true, false, false, DEFAULT_BORDER_COLOR, SpreadsheetApp.BorderStyle.SOLID)
    cell.setValue(people.name)

    cell = sheet.getRange(`G${positionStart}`)
    cell.setHorizontalAlignment(ALIGN_RIGHT)
    cell.setVerticalAlignment(ALIGN_MIDDLE)
    cell.setFontFamily(FONT_MONTSERRAT)
    cell.setFontWeight(FONT_STYLE_BOLD)
    cell.setBorder(true, true, true, false, false, false, DEFAULT_BORDER_COLOR, SpreadsheetApp.BorderStyle.SOLID)
    cell.setNumberFormat("#,##0.00")
    cell.setValue(fee)

    cell = sheet.getRange(`H${positionStart}`)
    cell.setBorder(true, false, true, true, false, false, DEFAULT_BORDER_COLOR, SpreadsheetApp.BorderStyle.SOLID)

    positionStart += 1
  })

  cell = sheet.getRange(`C${positionStart}:F${positionStart}`)
  cell.merge()
  cell.setHorizontalAlignment(ALIGN_CENTER)
  cell.setVerticalAlignment(ALIGN_MIDDLE)
  cell.setFontFamily(FONT_MONTSERRAT)
  cell.setFontWeight(FONT_STYLE_BOLD)
  cell.setFontSize(12)
  cell.setBorder(true, true, true, true, false, false, DEFAULT_BORDER_COLOR, SpreadsheetApp.BorderStyle.SOLID)
  cell.setValue("TOTAL")

  cell = sheet.getRange(`G${positionStart}`)
  cell.setHorizontalAlignment(ALIGN_RIGHT)
  cell.setVerticalAlignment(ALIGN_MIDDLE)
  cell.setFontFamily(FONT_MONTSERRAT)
  cell.setFontWeight(FONT_STYLE_BOLD)
  cell.setBorder(true, true, true, false, false, false, DEFAULT_BORDER_COLOR, SpreadsheetApp.BorderStyle.SOLID)
  cell.setNumberFormat("#,##0.00")
  cell.setFontSize(12)
  cell.setValue(fee * peopleList.length)

  cell = sheet.getRange(`H${positionStart}`)
  cell.setBorder(true, false, true, true, false, false, DEFAULT_BORDER_COLOR, SpreadsheetApp.BorderStyle.SOLID)

  return positionStart + 1
}

function displayShortTermPpl(sheet, peopleList, fee) {
  let positionStart = 17
  let cell = sheet.getRange(`J${positionStart}:O${positionStart}`)
  cell.merge()
  cell.setHorizontalAlignment(ALIGN_CENTER)
  cell.setVerticalAlignment(ALIGN_MIDDLE)
  cell.setBackground(DEFAULT_BORDER_COLOR)
  cell.setFontColor("#889caa")
  cell.setFontWeight(FONT_STYLE_BOLD)
  cell.setFontFamily(FONT_GEORGIA)
  cell.setFontSize(24)
  cell.setBorder(true, true, true, true, false, false, DEFAULT_BORDER_COLOR, SpreadsheetApp.BorderStyle.SOLID)
  cell.setValue("Short-Term")

  positionStart += 1
  cell = sheet.getRange(`J${positionStart}:O${positionStart}`)
  cell.setBackground("#889caa")

  cell = sheet.getRange(`J${positionStart}`)
  cell.setFontColor("white")
  cell.setHorizontalAlignment(ALIGN_CENTER)
  cell.setVerticalAlignment(ALIGN_MIDDLE)
  cell.setFontWeight(FONT_STYLE_BOLD)
  cell.setFontFamily(FONT_MONTSERRAT)
  cell.setBorder(true, true, true, true, false, false, DEFAULT_BORDER_COLOR, SpreadsheetApp.BorderStyle.SOLID)
  cell.setValue("No.")

  cell = sheet.getRange(`K${positionStart}`)
  cell.setFontColor("white")
  cell.setHorizontalAlignment(ALIGN_CENTER)
  cell.setVerticalAlignment(ALIGN_MIDDLE)
  cell.setFontWeight(FONT_STYLE_BOLD)
  cell.setFontFamily(FONT_MONTSERRAT)
  cell.setBorder(true, true, true, true, false, false, DEFAULT_BORDER_COLOR, SpreadsheetApp.BorderStyle.SOLID)
  cell.setValue("Name")

  cell = sheet.getRange(`L${positionStart}:M${positionStart}`)
  cell.merge()
  cell.setFontColor("white")
  cell.setHorizontalAlignment(ALIGN_CENTER)
  cell.setVerticalAlignment(ALIGN_MIDDLE)
  cell.setFontWeight(FONT_STYLE_BOLD)
  cell.setFontFamily(FONT_MONTSERRAT)
  cell.setBorder(true, true, true, true, false, false, DEFAULT_BORDER_COLOR, SpreadsheetApp.BorderStyle.SOLID)
  cell.setValue("Date")

  cell = sheet.getRange(`N${positionStart}:O${positionStart}`)
  cell.merge()
  cell.setFontColor("white")
  cell.setHorizontalAlignment(ALIGN_CENTER)
  cell.setVerticalAlignment(ALIGN_MIDDLE)
  cell.setFontWeight(FONT_STYLE_BOLD)
  cell.setFontFamily(FONT_MONTSERRAT)
  cell.setValue("Amount")
  cell.setBorder(true, true, true, true, false, false, DEFAULT_BORDER_COLOR, SpreadsheetApp.BorderStyle.SOLID)

  positionStart += 1
  let subTotalFee = 0
  peopleList.forEach((people, index) => {
    let cell = sheet.getRange(`J${positionStart}`)
    cell.setHorizontalAlignment(ALIGN_CENTER)
    cell.setVerticalAlignment(ALIGN_MIDDLE)
    cell.setFontFamily(FONT_MONTSERRAT)
    cell.setBorder(true, true, true, true, false, false, DEFAULT_BORDER_COLOR, SpreadsheetApp.BorderStyle.SOLID)
    cell.setValue(index + 1)

    let totalDay = dateRange(people.date.split("\n")[0], people.date.split("\n")[1]).length
    let totalFee = fee * totalDay
    subTotalFee += totalFee
    if (totalDay == 1) {
      totalDay = `${totalDay} day`
    } else {
      totalDay = `${totalDay} days`
    }
    cell = sheet.getRange(`K${positionStart}`)
    cell.setHorizontalAlignment(ALIGN_LEFT)
    cell.setVerticalAlignment(ALIGN_MIDDLE)
    cell.setFontFamily(FONT_MONTSERRAT)
    cell.setBorder(true, true, true, true, false, false, DEFAULT_BORDER_COLOR, SpreadsheetApp.BorderStyle.SOLID)
    cell.setValue(`${people.name} (${totalDay})`)

    cell = sheet.getRange(`L${positionStart}:M${positionStart}`)
    cell.merge()
    cell.setHorizontalAlignment(ALIGN_CENTER)
    cell.setVerticalAlignment(ALIGN_MIDDLE)
    cell.setFontFamily(FONT_MONTSERRAT)
    cell.setBorder(true, true, true, true, false, false, DEFAULT_BORDER_COLOR, SpreadsheetApp.BorderStyle.SOLID)
    cell.setValue(people.date)

    cell = sheet.getRange(`N${positionStart}`)
    cell.setHorizontalAlignment(ALIGN_RIGHT)
    cell.setVerticalAlignment(ALIGN_MIDDLE)
    cell.setFontFamily(FONT_MONTSERRAT)
    cell.setFontWeight(FONT_STYLE_BOLD)
    cell.setBorder(true, true, true, false, false, false, DEFAULT_BORDER_COLOR, SpreadsheetApp.BorderStyle.SOLID)
    cell.setNumberFormat("#,##0.00")
    cell.setValue(totalFee)

    cell = sheet.getRange(`O${positionStart}`)
    cell.setBorder(true, false, true, true, false, false, DEFAULT_BORDER_COLOR, SpreadsheetApp.BorderStyle.SOLID)

    positionStart += 1
  })

  cell = sheet.getRange(`J${positionStart}:M${positionStart}`)
  cell.merge()
  cell.setHorizontalAlignment(ALIGN_CENTER)
  cell.setVerticalAlignment(ALIGN_MIDDLE)
  cell.setFontFamily(FONT_MONTSERRAT)
  cell.setFontWeight(FONT_STYLE_BOLD)
  cell.setFontSize(12)
  cell.setBorder(true, true, true, true, false, false, DEFAULT_BORDER_COLOR, SpreadsheetApp.BorderStyle.SOLID)
  cell.setValue("TOTAL")

  cell = sheet.getRange(`N${positionStart}`)
  cell.setHorizontalAlignment(ALIGN_RIGHT)
  cell.setVerticalAlignment(ALIGN_MIDDLE)
  cell.setFontFamily(FONT_MONTSERRAT)
  cell.setFontWeight(FONT_STYLE_BOLD)
  cell.setFontSize(12)
  cell.setBorder(true, true, true, false, false, false, DEFAULT_BORDER_COLOR, SpreadsheetApp.BorderStyle.SOLID)
  cell.setNumberFormat("#,##0.00")
  cell.setValue(subTotalFee)

  cell = sheet.getRange(`O${positionStart}`)
  cell.setBorder(true, false, true, true, false, false, DEFAULT_BORDER_COLOR, SpreadsheetApp.BorderStyle.SOLID)

  return positionStart + 1
}

function displayWaterMark(sheet, positionStart) {
  let titleCell = sheet.getRange(`Q${positionStart}:T${positionStart}`)
  titleCell.merge()
  titleCell.setHorizontalAlignment(ALIGN_RIGHT)
  titleCell.setVerticalAlignment(ALIGN_MIDDLE)
  titleCell.setFontWeight(FONT_STYLE_BOLD)
  titleCell.setFontStyle(FONT_STYLE_ITALIC)
  titleCell.setFontSize(11)
  titleCell.setFontColor("#cc4224")
  titleCell.setValue(`PUB Share - SG [Bot]`)
}
