var spreadsheet = SpreadsheetApp.getActiveSheet();

var CALENDER_ID = """ CALENDER ID """
var eventCal = CalendarApp.getCalendarById(CALENDER_ID);

var TASK_LIST_ID = """ TASK LIST ID """
var tasksCal = Tasks.Tasklists.get(TASK_LIST_ID)


// Google color enums
var COMPLETED_COLOR = '8' // Gray
var INCOMPLETE_COLOR = '11' // Red

// Adjust to spreadsheet

var COURSE = 'A'
var DATE = 'B'
var TIME = 'D'
var TYPE = 'E'
var TITLE = 'F'
var COMPLETE = 'G'
var NOTES = 'H'
var TASK_COL = 'J'
var EVENT_COL = 'K'



/**
 * Adds or updates assignments as events on the specified calender
 * Adds or updates assignments as tasks on the specified task list
 */
function mainScript() {
  runTaskScript()
  runScript()
}
