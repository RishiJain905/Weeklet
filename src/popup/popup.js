import { getTasksByDate, setTasksByDate, getSettings, subscribe } from '../lib/storage.js';
import { toYmd, isToday, getWeekDays } from '../lib/date.js';

class WeekletPopup {
  constructor() {
    this.currentDate = new Date();
    this.selectedYmd = toYmd(this.currentDate);
    this.weekDays = [];
    this.filter = 'all'; // 'all' | 'active' | 'done'
    this.tasks = [];
    this.settings = {};
    this.unsubscribe = null;
    
    this.init();
  }

  async init() {
    try {
      // Load settings first to get startOfWeek
      this.settings = await getSettings();
      
      // Compute current week based on settings
      this.weekDays = getWeekDays(this.selectedYmd, this.settings.startOfWeek === 'Mon' ? 1 : 0);
      
      // Load tasks for selected day
      await this.loadTasks();
      
      // Set up storage change listener
      this.unsubscribe = subscribe((changedKeys, changes) => {
        this.handleStorageChange(changedKeys, changes);
      });
      
      this.render();
      this.attachEventListeners();
      
      console.log('Weeklet popup initialized with settings:', this.settings);
    } catch (error) {
      console.error('Failed to initialize Weeklet popup:', error);
      // Fallback to basic setup
      this.weekDays = getWeekDays(this.selectedYmd, 1);
      this.tasks = [];
      this.render();
      this.attachEventListeners();
    }
  }

  async loadTasks() {
    try {
      this.tasks = await getTasksByDate(this.selectedYmd);
      console.log(`Loaded ${this.tasks.length} tasks for ${this.selectedYmd}`);
    } catch (error) {
      console.error(`Failed to load tasks for ${this.selectedYmd}:`, error);
      this.tasks = [];
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
    
    if (titleEl) {
      const activeCount = this.tasks.filter(t => !t.completed).length;
      const totalCount = this.tasks.length;
      titleEl.textContent = `Weeklet ${totalCount > 0 ? `(${activeCount}/${totalCount})` : ''}`;
    }
    
    if (weekRangeEl) {
      const startDate = new Date(this.weekDays[0]);
      const endDate = new Date(this.weekDays[6]);
      
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

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    dayChipsEl.innerHTML = '';
    
    this.weekDays.forEach(dateStr => {
      const date = new Date(dateStr);
      const dayName = dayNames[date.getDay()];
      const dayDate = date.getDate();
      
      const chipEl = document.createElement('div');
      chipEl.className = 'day-chip';
      chipEl.dataset.date = dateStr;
      
      if (isToday(dateStr)) {
        chipEl.classList.add('today');
      }
      
      if (dateStr === this.selectedYmd) {
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

    // Filter tasks based on current filter
    let filteredTasks = this.tasks;
    if (this.filter === 'active') {
      filteredTasks = this.tasks.filter(t => !t.completed);
    } else if (this.filter === 'done') {
      filteredTasks = this.tasks.filter(t => t.completed);
    }

    // Sort: active tasks first, then completed (within each group, by creation time)
    filteredTasks.sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1; // Active tasks first
      }
      return (a.createdAt || 0) - (b.createdAt || 0); // Older first within same status
    });
    
    taskListEl.innerHTML = '';
    
    if (filteredTasks.length === 0) {
      // CSS :empty pseudo-class will show "No tasks" message
      return;
    }
    
    filteredTasks.forEach(task => {
      const taskEl = document.createElement('div');
      taskEl.className = 'task-item';
      if (task.completed) {
        taskEl.classList.add('completed');
      }
      taskEl.dataset.taskId = task.id;
      
      const priority = task.priority || 'low';
      const priorityIndicator = priority === 'high' ? '[HIGH]' : priority === 'medium' ? '[MED]' : '[LOW]';
      const priorityColor = priority === 'high' ? '#e74c3c' : priority === 'medium' ? '#f39c12' : '#27ae60';
      
      taskEl.innerHTML = `
        <div class="task-content">
          <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
          <div class="task-title">
            <span class="priority-indicator" style="color: ${priorityColor};">${priorityIndicator}</span>
            <span class="task-text">${task.title}</span>
          </div>
          <button class="delete-btn" title="Delete task">×</button>
        </div>
      `;
      
      taskListEl.appendChild(taskEl);
    });
  }

  attachEventListeners() {
    // Day chip selection
    const dayChipsEl = document.querySelector('.day-chips');
    if (dayChipsEl) {
      dayChipsEl.addEventListener('click', async (e) => {
        const chipEl = e.target.closest('.day-chip');
        if (chipEl && chipEl.dataset.date) {
          this.selectedYmd = chipEl.dataset.date;
          await this.loadTasks();
          this.render();
        }
      });
    }

    // Filter buttons
    const filtersEl = document.querySelector('.filters');
    if (filtersEl) {
      filtersEl.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-btn')) {
          // Update active filter button
          filtersEl.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
          e.target.classList.add('active');
          
          // Update filter state and re-render
          this.filter = e.target.dataset.filter;
          this.render();
        }
      });
    }

    // Task input
    const taskInput = document.getElementById('task-input');
    if (taskInput) {
      taskInput.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter' && taskInput.value.trim()) {
          e.preventDefault();
          
          const title = taskInput.value.trim();
          const priority = title.startsWith('!') ? 'high' : 'low';
          const cleanTitle = title.startsWith('!') ? title.slice(1).trim() : title;
          
          if (cleanTitle) {
            await this.addTask(cleanTitle, priority);
            taskInput.value = '';
          }
        }
      });

      // Focus input when popup opens
      setTimeout(() => taskInput.focus(), 100);
    }

    // Task interactions
    const taskListEl = document.querySelector('.task-list');
    if (taskListEl) {
      taskListEl.addEventListener('click', async (e) => {
        e.preventDefault();
        
        if (e.target.classList.contains('task-checkbox')) {
          const taskId = e.target.closest('.task-item').dataset.taskId;
          await this.toggleTask(taskId);
        } else if (e.target.classList.contains('delete-btn')) {
          const taskId = e.target.closest('.task-item').dataset.taskId;
          await this.deleteTask(taskId);
        }
      });
    }
  }

  async addTask(title, priority = 'low') {
    const task = {
      id: crypto.randomUUID(),
      title: title.trim(),
      completed: false,
      priority,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    // Optimistic update
    this.tasks.push(task);
    this.render();

    try {
      await setTasksByDate(this.selectedYmd, this.tasks);
      console.log('Task added:', task.title);
    } catch (error) {
      console.error('Failed to save new task:', error);
      // Revert optimistic update
      this.tasks = this.tasks.filter(t => t.id !== task.id);
      this.render();
    }
  }

  async toggleTask(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return;

    // Optimistic update
    task.completed = !task.completed;
    task.updatedAt = Date.now();
    this.render();

    try {
      await setTasksByDate(this.selectedYmd, this.tasks);
      console.log('Task toggled:', task.title, task.completed);
    } catch (error) {
      console.error('Failed to save task toggle:', error);
      // Revert optimistic update
      task.completed = !task.completed;
      this.render();
    }
  }

  async deleteTask(taskId) {
    const taskIndex = this.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;

    // Optimistic update
    const deletedTask = this.tasks.splice(taskIndex, 1)[0];
    this.render();

    try {
      await setTasksByDate(this.selectedYmd, this.tasks);
      console.log('Task deleted:', deletedTask.title);
    } catch (error) {
      console.error('Failed to delete task:', error);
      // Revert optimistic update
      this.tasks.splice(taskIndex, 0, deletedTask);
      this.render();
    }
  }

  handleStorageChange(changedKeys, changes) {
    const taskKey = `tasks_${this.selectedYmd}`;
    
    if (changedKeys.includes(taskKey)) {
      // Tasks for current day changed externally
      const newTasks = changes[taskKey]?.newValue;
      if (newTasks && JSON.stringify(newTasks) !== JSON.stringify(this.tasks)) {
        console.log('Tasks updated externally, refreshing...');
        this.tasks = newTasks;
        this.render();
      }
    }

    if (changedKeys.includes('settings')) {
      // Settings changed, may need to recalculate week
      const newSettings = changes.settings?.newValue;
      if (newSettings && newSettings.startOfWeek !== this.settings.startOfWeek) {
        console.log('Start of week changed, recalculating...');
        this.settings = newSettings;
        this.weekDays = getWeekDays(this.selectedYmd, this.settings.startOfWeek === 'Mon' ? 1 : 0);
        this.render();
      }
    }
  }

  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new WeekletPopup();
});
