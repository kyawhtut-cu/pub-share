let Logger = BetterLog.useSpreadsheet(PropertiesService.getScriptProperties().getProperty("SPREAD_SHEET_ID"))

function dateRange(startDate, endDate, steps = 1) {
  const dateArray = [];
  let currentDate = new Date(stringToDate(startDate, "dd-mm-yyyy", "-"));

  while (currentDate <= new Date(stringToDate(endDate, "dd-mm-yyyy", "-"))) {
    dateArray.push(new Date(currentDate));
    // Use UTC date to prevent problems with time zones and DST
    currentDate.setUTCDate(currentDate.getUTCDate() + steps);
  }

  return dateArray;
}

function stringToDate(_date, _format, _delimiter) {
  var formatLowerCase = _format.toLowerCase();
  var formatItems = formatLowerCase.split(_delimiter);
  var dateItems = _date.split(_delimiter);
  var monthIndex = formatItems.indexOf("mm");
  var dayIndex = formatItems.indexOf("dd");
  var yearIndex = formatItems.indexOf("yyyy");
  var month = parseInt(dateItems[monthIndex]);
  month -= 1;
  var formatedDate = new Date(dateItems[yearIndex], month, dateItems[dayIndex]);
  return formatedDate;
}

const FONT_GEORGIA = "Georgia"
const FONT_MONTSERRAT = "Montserrat"
const FONT_STYLE_BOLD = "bold"
const ALIGN_LEFT = "left"
const ALIGN_RIGHT = "right"
const ALIGN_MIDDLE = "middle"
const ALIGN_CENTER = "center"
const ALIGN_TOP = "top"
const ALIGN_BOTTOM = "bottom"
const DEFAULT_BORDER_COLOR = "#e6edf3"
