# AssigmentToCalender
Objective: Importing an assignment spreadsheet into google calenders and ask a task list

Google's Task API does not have the ability to specifically set the time of a task so the purpose of the task list is to provide an adjacent list to the calenders. I would prefer a Task List that corresponds time-wise but it is simply not possible, so the events are created. However, the event colors change when completed (Red = Incomplete, Green = Complete). Another option would be to manually move the task list but this is very tedious. 

Also provides an option to produce a heatmap of how busy classes are dependent on the spreadsheet

Directions: 

Copy of Blank Spreadsheet: ...

1. Change Conditional Formatting & Data Validation to the associated courses
2. Make sure to have at least 1 assignment at all times or the script cannot delete any of the assignments 
3. Do not delete an event on the calender; delete it within the spreadsheet


Be sure to replace the Task ID and Calender IDs in the code

`Calender.gs` -- execute runScript in the Extensions > App Script
`Tasks.gs` -- execute ...

