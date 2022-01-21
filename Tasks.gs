/**
 * BORROWED FROM: https://developers.google.com/apps-script/advanced/tasks
 * Returns a List IDS for different Task Lists 
 * */
function listTaskLists() {
  var taskLists = Tasks.Tasklists.list();
  if (taskLists.items) {
    for (var i = 0; i < taskLists.items.length; i++) {
      var taskList = taskLists.items[i];
      Logger.log('Task list with title "%s" and ID "%s" was found.',
          taskList.title, taskList.id);
    }
  } else {
    Logger.log('No task lists found.');
  }
}

/**
 * Adds a given task to the task list with the specified components
 */
function addTask(taskListId, task_title, type, notes, date, course) {

  var task_obj = {
    title: task_title,
    notes: `${course} - ${type} : ${notes}`,
    due: date.toISOString()
  }

  task = Tasks.Tasks.insert(task_obj, taskListId)
  Logger.log(`CREATED: ${task.title} [${task.id}]`);
  return task.id
}

/**
 * Updates any potential title changes
 */
function changedTaskTitle(row, task, taskListID, task_id) {
  var cell_title = getValue(TITLE, row)
  if (task.title != cell_title) {
    task.title = cell_title
    Tasks.Tasks.update(task, taskListID, task_id)

    Logger.log(`UPDATED TITLE: ${cell_title}, [${task.id}]`)
  }
}

/**
 * Updates any potential date changes
 */
function changedTaskDate(row, task, taskListID, task_id) {
  var cell_date = getValue(DATE, row)
  var task_date = getTaskDate(task.due)

  if (task_date.toLocaleDateString() != cell_date.toLocaleDateString()) {
    task.due = cell_date.toISOString()
    Tasks.Tasks.update(task, taskListID, task_id)

    Logger.log(`UPDATED DATE: ${task.title} TP ${task.due}, [${task.id}]`)
  }
}

/**
 * Gets the task date from a certain format
 */
function getTaskDate(task_date) {
  var date = task_date.slice(0, 10)
  var new_date = new Date(date.slice(0,4), date.slice(6, 7) - 1, date.slice(8,10))
  return new_date
}

/**
 * Updates any potentital notes changes 
 */
function changedTaskNotes(row, task, taskListID, task_id) {
  var cell_course = getValue(COURSE, row)
  var cell_type = getValue(TYPE, row)
  var cell_notes = getValue(NOTES, row)

  var cell_desc = `${cell_course} - ${cell_type} : ${cell_notes}`

  if (task.notes !== cell_desc) {
    task.notes = cell_desc
    Tasks.Tasks.update(task, taskListID, task_id)

    Logger.log(`UPDATED NOTES FOR: ${task.title}, [${task.id}]`)
  }
}



/**
 * Runs Task Script
 */
function runTaskScript() {

  var columnToCheck = spreadsheet.getRange("A:A").getValues();
  var lastRow = getLastRowSpecial(columnToCheck);

  rows = lastRow

  var all_tasks = Tasks.Tasks.list(TASK_LIST_ID)
  var cell_tasks = []

  for (let r = 3; r < rows + 1; r++) { // Until last column
    var task_id = getValue(TASK_COL, r)
    var completed = getValue(COMPLETE, r)


    if (task_id == "" && r != null) {
      var title = getValue(TITLE, r)
      var start_date = getValue(DATE, r)
      var course = getValue(COURSE, r)
      var type = getValue(TYPE, r)
      var notes = getValue(NOTES, r)

      taskID = addTask(TASK_LIST_ID, title, type, notes, start_date, course)
      task = Tasks.Tasks.get(TASK_LIST_ID, taskID)

      spreadsheet.getRange(TASK_COL + r).setValue(taskID)

      if (completed) {
        task.status = 'completed'
        Tasks.Tasks.update(task, TASK_LIST_ID, task_id)
      }

      cell_tasks.push(task_id)

    } else {
      // 1. Completes Tasks & Updates Spreadsheet
      var task = Tasks.Tasks.get(TASK_LIST_ID, task_id);

      if ((task.status == 'needsAction' && completed) || (task.status == 'completed' && !completed)) {
        task.status = 'completed'
        Tasks.Tasks.update(task, TASK_LIST_ID, task_id)
        spreadsheet.getRange(COMPLETE + r).setValue(true)
        Logger.log(`MARKED AS COMPLETED: ${task.title} [${task.id}]`)
      } 

      changedTaskTitle(r, task, TASK_LIST_ID, task_id)
      changedTaskDate(r, task, TASK_LIST_ID, task_id)
      // changedTaskNotes(r, task, TASK_LIST_ID, task_id)

      cell_tasks.push(task_id)

    }
  }
  if (cell_tasks.length > 0) {
    for (var i = 0; i < all_tasks.items.length; i++) {
      let t = all_tasks.items[i]
      if (!cell_tasks.includes(t.id)) {
        Logger.log(`DELETING EVENT ${t.title} FOR ${t.notes} ON ${getTaskDate(t.due)}`)
        Tasks.Tasks.remove(TASK_LIST_ID, t.id)
      }
      t = ''
    } // Cell Length = 0
  }
}

