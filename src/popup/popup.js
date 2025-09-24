// Import utilities
import { formatDate, isToday, getWeekDays, getDayName } from '../lib/date.js';
import { storageGet, storageSet } from '../lib/storage.js';

// State
let selectedDate = formatDate(new Date());
let tasks = [];

// Mock data for initial testing
const mockTasks = [
  {
    id: '1',
    title: 'Review project proposal',
    date: formatDate(new Date()),
    done: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Team standup meeting',
    date: formatDate(new Date()),
    done: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Update documentation',
    date: formatDate(new Date(Date.now() + 24 * 60 * 60 * 1000)),
    done: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// DOM Elements
const weekdayChipsContainer = document.getElementById('weekday-chips');
const taskInput = document.getElementById('task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const selectedDayName = document.getElementById('selected-day-name');
const tasksList = document.getElementById('tasks-list');
const currentWeekSpan = document.getElementById('current-week');

// Initialize the popup
async function init() {
  try {
    const storedTasks = await storageGet('tasks');
    tasks = storedTasks || mockTasks;
  } catch (error) {
    console.log('Using mock data for initial setup');
    tasks = mockTasks;
  }
  
  renderWeekdays();
  renderTasks();
  updateSelectedDayDisplay();
  updateWeekInfo();
  
  addTaskBtn.addEventListener('click', handleAddTask);
  taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleAddTask();
    }
  });
}

// Render weekday chips
function renderWeekdays() {
  const weekDays = getWeekDays();
  const today = formatDate(new Date());
  
  weekdayChipsContainer.innerHTML = '';
  
  weekDays.forEach(day => {
    const chip = document.createElement('div');
    chip.className = 'weekday-chip';
    chip.dataset.date = day.date;
    
    if (day.date === today) {
      chip.classList.add('today');
    }
    if (day.date === selectedDate) {
      chip.classList.add('selected');
    }
    
    chip.innerHTML = `
      <span class="weekday-name">${day.name}</span>
      <span class="weekday-date">${day.dayNum}</span>
    `;
    
    chip.addEventListener('click', () => {
      selectDay(day.date);
    });
    
    weekdayChipsContainer.appendChild(chip);
  });
}

function selectDay(date) {
  selectedDate = date;
  
  document.querySelectorAll('.weekday-chip').forEach(chip => {
    chip.classList.remove('selected');
    if (chip.dataset.date === date) {
      chip.classList.add('selected');
    }
  });
  
  updateSelectedDayDisplay();
  renderTasks();
}

function updateSelectedDayDisplay() {
  const dayName = getDayName(selectedDate);
  const today = formatDate(new Date());
  
  if (selectedDate === today) {
    selectedDayName.textContent = 'Today';
  } else {
    selectedDayName.textContent = dayName;
  }
}

function updateWeekInfo() {
  const weekDays = getWeekDays();
  const startDay = weekDays[0];
  const endDay = weekDays[6];
  
  const startMonth = new Date(startDay.date).toLocaleDateString('en-US', { month: 'short' });
  const endMonth = new Date(endDay.date).toLocaleDateString('en-US', { month: 'short' });
  const year = new Date().getFullYear();
  
  if (startMonth === endMonth) {
    currentWeekSpan.textContent = `Week of ${startMonth} ${startDay.dayNum}-${endDay.dayNum}, ${year}`;
  } else {
    currentWeekSpan.textContent = `Week of ${startMonth} ${startDay.dayNum} - ${endMonth} ${endDay.dayNum}, ${year}`;
  }
}

async function handleAddTask() {
  const title = taskInput.value.trim();
  if (!title) return;
  
  const newTask = {
    id: Date.now().toString(),
    title,
    date: selectedDate,
    done: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  tasks.push(newTask);
  await saveTasks();
  
  taskInput.value = '';
  renderTasks();
}

async function toggleTask(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.done = !task.done;
    task.updatedAt = new Date().toISOString();
    await saveTasks();
    renderTasks();
  }
}

async function deleteTask(taskId) {
  tasks = tasks.filter(t => t.id !== taskId);
  await saveTasks();
  renderTasks();
}

function renderTasks() {
  const dayTasks = tasks.filter(task => task.date === selectedDate);
  
  if (dayTasks.length === 0) {
    tasksList.innerHTML = `
      <div class="empty-state">
        No tasks for this day.<br>
        Add one above!
      </div>
    `;
    return;
  }
  
  tasksList.innerHTML = '';
  
  dayTasks.sort((a, b) => {
    if (a.done !== b.done) {
      return a.done ? 1 : -1;
    }
    return new Date(a.createdAt) - new Date(b.createdAt);
  });
  
  dayTasks.forEach(task => {
    const taskElement = document.createElement('div');
    taskElement.className = 'task-item';
    
    taskElement.innerHTML = `
      <input 
        type="checkbox" 
        class="task-checkbox" 
        ${task.done ? 'checked' : ''}
        data-task-id="${task.id}"
      >
      <span class="task-text ${task.done ? 'completed' : ''}">${task.title}</span>
      <button class="task-delete" data-task-id="${task.id}">×</button>
    `;
    
    const checkbox = taskElement.querySelector('.task-checkbox');
    const deleteBtn = taskElement.querySelector('.task-delete');
    
    checkbox.addEventListener('change', () => toggleTask(task.id));
    deleteBtn.addEventListener('click', () => deleteTask(task.id));
    
    tasksList.appendChild(taskElement);
  });
}

async function saveTasks() {
  try {
    await storageSet('tasks', tasks);
  } catch (error) {
    console.error('Failed to save tasks:', error);
  }
}

document.addEventListener('DOMContentLoaded', init);
