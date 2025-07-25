document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const taskInput = document.getElementById('task-input');
    const addBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const clearAllBtn = document.getElementById('clear-all-btn');
    const tasksCount = document.getElementById('tasks-count');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const dailyQuote = document.getElementById('daily-quote');
    const currentDate = document.getElementById('current-date');

    // Motivational Quotes
    const quotes = [
        "Productivity is never an accident.",
        "Small steps every day lead to big results.",
        "Done is better than perfect.",
        "Stay focused and never give up.",
        "The secret of getting ahead is getting started."
    ];

    // Set random quote
    dailyQuote.textContent = quotes[Math.floor(Math.random() * quotes.length)];

    // Set current date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDate.textContent = new Date().toLocaleDateString('en-US', options);

    // Dark Mode Toggle
    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        darkModeToggle.innerHTML = document.body.classList.contains('dark-mode')
            ? '<i class="fas fa-sun"></i>'
            : '<i class="fas fa-moon"></i>';
    });

    // Load tasks from localStorage
    loadTasks();

    // Add Task
    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    // Clear All Tasks
    clearAllBtn.addEventListener('click', () => {
        if (taskList.children.length > 0 && confirm('Clear all tasks?')) {
            taskList.innerHTML = '';
            localStorage.removeItem('tasks');
            updateTaskCount();
        }
    });

    // Filter Tasks
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterTasks(btn.dataset.filter);
        });
    });

    // Add a new task
    function addTask() {
        const taskText = taskInput.value.trim();
        if (!taskText) return;

        // Play sound
        document.getElementById('add-sound').play();

        const task = {
            id: Date.now(),
            text: taskText,
            completed: false,
            createdAt: new Date().toISOString()
        };

        addTaskToDOM(task);
        saveTask(task);
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

        li.querySelector('.task-checkbox').addEventListener('change', toggleTask);
        li.querySelector('.delete-btn').addEventListener('click', deleteTask);

        if (task.completed) li.classList.add('completed');

        taskList.appendChild(li);
    }

    // Toggle task completion
    function toggleTask(e) {
        const taskId = parseInt(e.target.closest('.task-item').dataset.id);
        const tasks = getTasks();
        const task = tasks.find(t => t.id === taskId);

        if (task) {
            task.completed = e.target.checked;
            localStorage.setItem('tasks', JSON.stringify(tasks));
            e.target.closest('.task-item').classList.toggle('completed');
            document.getElementById('complete-sound').play();
            updateTaskCount();
        }
    }

    // Delete task
    function deleteTask(e) {
        const taskId = parseInt(e.target.closest('.task-item').dataset.id);
        const tasks = getTasks().filter(task => task.id !== taskId);

        localStorage.setItem('tasks', JSON.stringify(tasks));
        e.target.closest('.task-item').classList.add('fade-out');

        setTimeout(() => {
            e.target.closest('.task-item').remove();
            updateTaskCount();
        }, 300);

        document.getElementById('delete-sound').play();
    }

    // Filter tasks
    function filterTasks(filter) {
        const tasks = getTasks();
        const taskItems = document.querySelectorAll('.task-item');

        taskItems.forEach(item => {
            const taskId = parseInt(item.dataset.id);
            const task = tasks.find(t => t.id === taskId);

            switch (filter) {
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

    // Update task counter
    function updateTaskCount() {
        const tasks = getTasks();
        const total = tasks.length;
        const completed = tasks.filter(task => task.completed).length;

        tasksCount.textContent = `${completed} of ${total} tasks done`;
    }

    // Load tasks from localStorage
    function loadTasks() {
        const tasks = getTasks();
        tasks.forEach(task => addTaskToDOM(task));
        updateTaskCount();
    }

    // Get tasks from localStorage
    function getTasks() {
        return JSON.parse(localStorage.getItem('tasks')) || [];
    }

    // Save task to localStorage
    function saveTask(task) {
        const tasks = getTasks();
        tasks.push(task);
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
});