// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Function to generate a unique task id
function generateTaskId() {
  return nextId++;
}

// Function to get card class based on due date and status
function getCardClass(dueDate, status) {
  if (status === 'done') {
    return 'on-time';
  }

  const today = dayjs();
  const due = dayjs(dueDate);

  if (due.isBefore(today, 'day')) {
    return 'overdue';
  } else if (due.diff(today, 'day') <= 3) {
    return 'due-soon';
  } else {
    return 'on-time';
  }
}

// Function to create a task card
function createTaskCard(task) {
  const cardClass = getCardClass(task.dueDate, task.status);

  return `
    <div class="card mb-3 ${cardClass}" data-task-id="${task.id}">
      <div class="card-body">
        <h4 class="card-title">${task.title}</h4>
        <p class="card-text">${task.description}</p>
        <p class="card-text"><small class="text-muted">Due: ${task.dueDate}</small></p>
        <button class="btn btn-danger btn-sm delete-task">Delete</button>
      </div>
    </div>
  `;
}

// Function to render the task list and make cards draggable
function renderTaskList() {
  const lanes = {
    'to-do': $('#todo-cards'),
    'in-progress': $('#in-progress-cards'),
    'done': $('#done-cards')
  };

  // Clear existing tasks
  for (const lane in lanes) {
    lanes[lane].empty();
  }

  // Render tasks
  taskList.forEach(task => {
    const taskCard = createTaskCard(task);
    lanes[task.status].append(taskCard);
  });

  // Make task cards draggable
  $('.card').draggable({
    revert: 'invalid',
    start: function(event, ui) {
      $(this).css('z-index', 1000);
    },
    stop: function(event, ui) {
      $(this).css('z-index', 1);
    }
  });

  // Attach delete event handlers
  $('.delete-task').on('click', handleDeleteTask);
}

// Function to handle adding a new task
function handleAddTask(event) {
  event.preventDefault();
  const taskTitle = $('#taskTitle').val();
  const taskDescription = $('#taskDescription').val();
  const dueDate = $('#dueDate').val();
  const taskId = generateTaskId();

  const newTask = {
    id: taskId,
    title: taskTitle,
    description: taskDescription,
    dueDate: dueDate,
    status: 'to-do'
  };

  taskList.push(newTask);
  saveTasks();
  renderTaskList();
  $('#taskForm')[0].reset();
  $('#formModal').modal('hide');
}

// Function to handle deleting a task
function handleDeleteTask(event) {
  const taskId = $(event.target).closest('.card').data('task-id');
  taskList = taskList.filter(task => task.id !== taskId);
  saveTasks();
  renderTaskList();
}

// Function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
  const taskId = ui.draggable.data('task-id');
  const newStatus = $(event.target).closest('.lane').attr('id');

  taskList = taskList.map(task => {
    if (task.id === taskId) {
      task.status = newStatus;
    }
    return task;
  });

  saveTasks();
  renderTaskList();
}

// Save tasks and nextId to localStorage
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(taskList));
  localStorage.setItem('nextId', JSON.stringify(nextId));
}

// When the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
  renderTaskList();

  // Add event listener for adding a new task
  $('#taskForm').on('submit', handleAddTask);

  // Make lanes droppable
  $('.lane .card-body').droppable({
    accept: '.card',
    drop: handleDrop,
    hoverClass: 'lane-hover'
  });

  // Make the due date field a date picker
  $('#dueDate').datepicker({
    dateFormat: 'yy-mm-dd'
  });
});
