/**
 * @Returns the starting (due) date for an assignment based on the Due Date and Time Column
 */
function getStartDate(row) {
  var date = new Date(spreadsheet.getRange(DATE + row).getValue()) //Getting the date
  var time = new Date(spreadsheet.getRange(TIME + row).getValue()) //Getting the time

  date.setHours(time.getHours())
  date.setMinutes(time.getMinutes())

  return date
}

/**
 * @Returns a new date that adds 1 minute to the given date
 */
function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}

/**
 * @Returns the event id of a new event populated with a title, start and end time, completion boolean, location (course), type, and notes  
 */
function addEvent(title, startdate, enddate, completed, location, type, notes) {
  var event = eventCal.createEvent(title, startdate, enddate)
  if (completed) {
    event.setColor(COMPLETED_COLOR) // White if completed
  } else {
    event.setColor(INCOMPLETE_COLOR) // Red if not completed
  }

  event.setLocation(location)
  event.setDescription(type + " : " + notes)

  Logger.log(`CREATE: ${event.getTitle()} @ ${event.getStartTime().toLocaleString()} FOR ${event.getLocation()}`)

  return event.getId()
}

/**
 * @Returns the cell value in a given column and row
 */
function getValue(col, row) {
  return spreadsheet.getRange(col + row).getValue()
}

/**
 * Changes the event color depending on completion task
 */
function changedColor(row, title, event_color, eventID, event) {
  var event = eventCal.getEventById(eventID)
  var completed = getValue(COMPLETE, row)

  if (event_color == INCOMPLETE_COLOR && completed) {// event_color is RED but assignment is completed 
    event.setColor(COMPLETED_COLOR)
    Logger.log(`UPDATED COLOR: ${title} to Completed [${eventID}]`)
  } else if (event_color == COMPLETED_COLOR && !completed) { //event_color is GREEN but assignment is not completed
    event.setColor(INCOMPLETE_COLOR)
    Logger.log(`UPDATED COLOR: ${title} to Incomplete [${eventID}]`)
  }
}

/**
 * Changes the event date if the corresponding cell is changed
 */
function changedDate(row, title, start_time, eventID, event) {
  var cell_start_time = getStartDate(row)

  if (start_time != cell_start_time.toLocaleString()) {
    event.setTime(cell_start_time, addMinutes(cell_start_time, 1))
    Logger.log(`UPDATED DATE: ${title} to ${event.getStartTime().toLocaleString()} [${eventID}]`)
  }
}

/**
 * Changes the event title if the corresponding cell is changed
 */
function changedTitle(row, title, eventID, event) {
  var cell_title = getValue(TITLE, row)

  if (title !== cell_title) {
    event.setTitle(cell_title)
    Logger.log(`UPDATED TITLE: ${title} to ${cell_title} [${eventID}]`)
  }

}

/**
 * Changes the event course if the corresponding cell is changed
 */
function changedCourse(row, title, course, eventID, event) {
  var cell_course = getValue(COURSE, row)

  if (course !== cell_course) {
    event.setLocation(cell_course)
    Logger.log(`UPDATE COURSE: ${title} to ${cell_course} [${eventID}]`)
  }
}

/**
 * Changes the event notes and description if the corresponding cell is changed
 */
function changedTypeAndNotes(row, title, desc, eventID, event) {
  var cell_type = getValue(TYPE, row)
  var cell_notes = getValue(NOTES, row)
  var cell_desc = cell_type + " : " + cell_notes

  if (desc != cell_desc) {
    event.setDescription(cell_desc)
    Logger.log(`UPDATED NOTES: ${title} NOTES [${eventID}]`)
  }
}

/************************************************************************
 * Source: https://yagisanatode.com/2019/05/11/google-apps-script-get-the-last-row-of-a-data-range-when-other-columns-have-content-like-hidden-formulas-and-check-boxes/
 * Gets the last row number based on a selected column range values
 *
 * @param {array} range : takes a 2d array of a single column's values
 *
 * @returns {number} : the last row number with a value. 
 *
 */
function getLastRowSpecial(range) {
  var rowNum = 0
  var blank = false
  for (var row = 0; row < range.length; row++) {

    if (range[row][0] === "" && !blank) {
      rowNum = row
      blank = true

    } else if (range[row][0] !== "") {
      blank = false
    }
  }
  return rowNum
}



/**
 * Runs the full Script
 */
function runScript() {
  var columnToCheck = spreadsheet.getRange("A:A").getValues();
  var lastRow = getLastRowSpecial(columnToCheck);

  rows = lastRow

  var firstDay = new Date(2022, 0, 01);
  var lastDay = new Date(2022, 04, 06);
  var events = eventCal.getEvents(firstDay, lastDay)
  var cell_events = []

  // Iterates through the cell
  for (let r = 3; r < rows + 1; r++) { // Until last column
    var eventID = getValue(EVENT_COL, r)
    if (eventID == "" && r !== null && getValue('F', r) != "") { // EventID has changed

      var title = getValue(TITLE, r)
      var start_date = getStartDate(r)
      var end_date = addMinutes(start_date, 1)
      var completed = getValue(COMPLETE, r)
      var course = getValue(COURSE, r)
      var type = getValue(TYPE, r)
      var notes = getValue(NOTES, r)

      var eventID = addEvent(title, start_date, end_date, completed, course, type, notes)
      cell_events.push(eventID)

      spreadsheet.getRange(EVENT_COL + r).setValue(eventID)
    } else {
      // Checks for any updates
      if (getValue(TITLE, r) != "") {
        var event = eventCal.getEventById(eventID)
        var event_title = event.getTitle()

        changedColor(r, event_title, event.getColor(), eventID, event)
        changedDate(r, event_title, event.getStartTime().toLocaleString(), eventID, event)
        changedTitle(r, event_title, eventID, event)
        changedCourse(r, event_title, event.getLocation(), eventID, event)
        changedTypeAndNotes(r, event_title, event.getDescription(), eventID, event)

        cell_events.push(eventID)
      }
    }
  }

  // Deletes events no longer in spreadsheet
  if (cell_events.length > 0) {
    for (var i = 0; i < events.length; i++) {
      let e = events[i]
      if (!cell_events.includes(e.getId())) {
        Logger.log(`DELETING EVENT ${e.getTitle()} FOR ${e.getLocation()} ON ${e.getStartTime().toLocaleString()}`)
        e.deleteEvent()
      }
      e = ''
    } // Cell Length = 0
  }
}


