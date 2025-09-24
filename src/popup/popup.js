import { storageGet, storageSet } from '../lib/storage.js';
import { toYmd, isToday, getWeekDays } from '../lib/date.js';

// Mock data for demonstration
const MOCK_TASKS = [
  {
    id: 'task-1',
    title: 'Review weekly report',
    completed: false,
    date: toYmd(new Date()),
    priority: 'high'
  },
  {
    id: 'task-2',
    title: 'Team standup meeting',
    completed: true,
    date: toYmd(new Date(Date.now() + 24 * 60 * 60 * 1000)), // Tomorrow
    priority: 'medium'
  },
  {
    id: 'task-3',
    title: 'Update project documentation',
    completed: false,
    date: toYmd(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)), // Day after tomorrow
    priority: 'low'
  }
];

class WeekletPopup {
  constructor() {
    this.currentDate = new Date();
    this.selectedDate = toYmd(this.currentDate);
    this.weekStart = 1; // Monday = 1, Sunday = 0
    this.tasks = [];
    
    this.init();
  }

  async init() {
    try {
      // Load tasks from storage or use mock data
      const storedTasks = await storageGet('tasks');
      this.tasks = storedTasks || MOCK_TASKS;
      
      // Save mock data if no data exists
      if (!storedTasks) {
        await storageSet('tasks', MOCK_TASKS);
      }
      
      this.render();
      this.attachEventListeners();
    } catch (error) {
      console.error('Failed to initialize Weeklet popup:', error);
      // Use mock data as fallback
      this.tasks = MOCK_TASKS;
      this.render();
      this.attachEventListeners();
    }
  }

  render() {
    this.renderHeader();
    this.renderWeekNavigation();
    this.renderTaskList();
  }

  renderHeader() {
    const titleEl = document.querySelector('.title');
    const weekRangeEl = document.querySelector('.week-range');
    
    if (titleEl) titleEl.textContent = 'Weeklet';
    
    if (weekRangeEl) {
      const weekDays = getWeekDays(this.selectedDate, this.weekStart);
      const startDate = new Date(weekDays[0]);
      const endDate = new Date(weekDays[6]);
      
      const formatDate = (date) => {
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
      };
      
      weekRangeEl.textContent = `${formatDate(startDate)} - ${formatDate(endDate)}`;
    }
  }

  renderWeekNavigation() {
    const dayChipsEl = document.querySelector('.day-chips');
    if (!dayChipsEl) return;

    const weekDays = getWeekDays(this.selectedDate, this.weekStart);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    dayChipsEl.innerHTML = '';
    
    weekDays.forEach(dateStr => {
      const date = new Date(dateStr);
      const dayName = dayNames[date.getDay()];
      const dayDate = date.getDate();
      
      const chipEl = document.createElement('div');
      chipEl.className = 'day-chip';
      chipEl.dataset.date = dateStr;
      
      if (isToday(dateStr)) {
        chipEl.classList.add('today');
      }
      
      if (dateStr === this.selectedDate) {
        chipEl.classList.add('selected');
      }
      
      chipEl.innerHTML = `
        <span class="day-name">${dayName}</span>
        <span class="day-date">${dayDate}</span>
      `;
      
      dayChipsEl.appendChild(chipEl);
    });
  }

  renderTaskList() {
    const taskListEl = document.querySelector('.task-list');
    if (!taskListEl) return;

    const selectedTasks = this.tasks.filter(task => task.date === this.selectedDate);
    
    taskListEl.innerHTML = '';
    
    if (selectedTasks.length === 0) {
      // CSS :empty pseudo-class will show "No tasks" message
      return;
    }
    
    selectedTasks.forEach(task => {
      const taskEl = document.createElement('div');
      taskEl.className = 'task-item';
      taskEl.dataset.taskId = task.id;
      
      const priorityIndicator = task.priority === 'high' ? '[HIGH]' : task.priority === 'medium' ? '[MED]' : '[LOW]';
      const priorityColor = task.priority === 'high' ? '#e74c3c' : task.priority === 'medium' ? '#f39c12' : '#27ae60';
      const completedStyle = task.completed ? 'text-decoration: line-through; opacity: 0.6;' : '';
      
      taskEl.innerHTML = `
        <div class="task-title" style="${completedStyle}">
          <span style="color: ${priorityColor}; font-weight: bold; font-size: 11px;">${priorityIndicator}</span> ${task.title}
          <div class="task-meta">Priority: ${task.priority}${task.completed ? ' • Completed' : ''}</div>
        </div>
      `;
      
      taskListEl.appendChild(taskEl);
    });
  }

  attachEventListeners() {
    // Day chip selection
    const dayChipsEl = document.querySelector('.day-chips');
    if (dayChipsEl) {
      dayChipsEl.addEventListener('click', (e) => {
        const chipEl = e.target.closest('.day-chip');
        if (chipEl && chipEl.dataset.date) {
          this.selectedDate = chipEl.dataset.date;
          this.render();
        }
      });
    }

    // Task item interactions (for future implementation)
    const taskListEl = document.querySelector('.task-list');
    if (taskListEl) {
      taskListEl.addEventListener('click', (e) => {
        const taskEl = e.target.closest('.task-item');
        if (taskEl && taskEl.dataset.taskId) {
          console.log('Task clicked:', taskEl.dataset.taskId);
          // Future: Add task editing/completion functionality
        }
      });
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new WeekletPopup();
});
