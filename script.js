document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const taskInput = document.getElementById('task-input');
    const addBtn = document.getElementById('add-btn');
    const taskList = document.getElementById('task-list');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const clearAllBtn = document.getElementById('clear-all');
    const tasksCount = document.getElementById('tasks-count');
    const dateDisplay = document.getElementById('date-display');

    // Sound Elements
    const addSound = document.getElementById('add-sound');
    const deleteSound = document.getElementById('delete-sound');
    const completeSound = document.getElementById('complete-sound');

    // Current filter
    let currentFilter = 'all';

    // Set current date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateDisplay.textContent = new Date().toLocaleDateString('en-US', options);

    // Load tasks from localStorage
    loadTasks();

    // Event Listeners
    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') addTask();
    });

    clearAllBtn.addEventListener('click', clearAllTasks);

    // Event delegation for task list
    taskList.addEventListener('click', function (e) {
        // Check if click was on checkbox
        if (e.target.classList.contains('task-checkbox')) {
            toggleTask(e);
        }
        // Check if click was on delete button
        else if (e.target.closest('.delete-btn')) {
            deleteTask(e);
        }
    });

    // Filter buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            filterTasks();
        });
    });

    // Add a new task
    function addTask() {
        const taskText = taskInput.value.trim();
        if (!taskText) {
            // Show error animation
            taskInput.classList.add('error');
            setTimeout(() => taskInput.classList.remove('error'), 1000);
            return;
        }

        // Play add sound
        addSound.currentTime = 0;
        addSound.play();

        // Create task object
        const task = {
            id: Date.now(),
            text: taskText,
            completed: false,
            createdAt: new Date().toISOString()
        };

        // Add to DOM
        addTaskToDOM(task);

        // Add to localStorage
        const tasks = getTasks();
        tasks.push(task);
        saveTasks(tasks);

        // Clear input and update count
        taskInput.value = '';
        updateTaskCount();
    }

    // Add task to DOM
    function addTaskToDOM(task) {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.dataset.id = task.id;

        li.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            <span class="task-text">${task.text}</span>
            <button class="delete-btn"><i class="fas fa-trash"></i></button>
        `;

        if (task.completed) li.classList.add('completed');

        taskList.appendChild(li);
    }

    // Toggle task completion
    function toggleTask(e) {
        const taskId = parseInt(e.target.closest('.task-item').dataset.id);
        const tasks = getTasks();
        const taskIndex = tasks.findIndex(task => task.id === taskId);

        if (taskIndex !== -1) {
            tasks[taskIndex].completed = e.target.checked;
            saveTasks(tasks);

            // Play complete sound
            completeSound.currentTime = 0;
            completeSound.play();

            // Update DOM
            e.target.closest('.task-item').classList.toggle('completed');
            filterTasks();
            updateTaskCount();
        }
    }

    // Delete task
    function deleteTask(e) {
        const taskId = parseInt(e.target.closest('.task-item').dataset.id);
        const tasks = getTasks().filter(task => task.id !== taskId);
        saveTasks(tasks);

        // Play delete sound
        deleteSound.currentTime = 0;
        deleteSound.play();

        // Animate removal
        const taskItem = e.target.closest('.task-item');
        taskItem.style.transform = 'translateX(100%)';
        taskItem.style.opacity = '0';

        setTimeout(() => {
            taskItem.remove();
            updateTaskCount();
        }, 300);
    }

    // Clear all tasks
    function clearAllTasks() {
        if (taskList.children.length === 0) return;

        if (confirm('Are you sure you want to delete all tasks?')) {
            // Animate removal of all tasks
            const items = document.querySelectorAll('.task-item');
            items.forEach((item, index) => {
                setTimeout(() => {
                    item.style.transform = 'translateX(100%)';
                    item.style.opacity = '0';
                    setTimeout(() => item.remove(), 300);
                }, index * 100);
            });

            // Clear localStorage
            localStorage.removeItem('tasks');

            // Update count after animations complete
            setTimeout(updateTaskCount, items.length * 100 + 300);
        }
    }

    // Filter tasks
    function filterTasks() {
        const tasks = getTasks();
        const taskItems = document.querySelectorAll('.task-item');

        taskItems.forEach(item => {
            const taskId = parseInt(item.dataset.id);
            const task = tasks.find(t => t.id === taskId);

            switch (currentFilter) {
                case 'all':
                    item.style.display = 'flex';
                    break;
                case 'active':
                    item.style.display = task && !task.completed ? 'flex' : 'none';
                    break;
                case 'completed':
                    item.style.display = task && task.completed ? 'flex' : 'none';
                    break;
            }
        });
    }

    // Update task count
    function updateTaskCount() {
        const tasks = getTasks();
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.completed).length;

        tasksCount.textContent = `${completedTasks} of ${totalTasks} tasks completed`;
    }

    // Load tasks from localStorage
    function loadTasks() {
        const tasks = getTasks();
        tasks.forEach(task => addTaskToDOM(task));
        updateTaskCount();
        filterTasks();
    }

    // Get tasks from localStorage
    function getTasks() {
        return JSON.parse(localStorage.getItem('tasks')) || [];
    }

    // Save tasks to localStorage
    function saveTasks(tasks) {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
});