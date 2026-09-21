const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const priorityInput = document.getElementById("priorityInput");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const clearCompleted = document.getElementById("clearCompleted");
const themeToggle = document.getElementById("themeToggle");

const totalTasks = document.getElementById("totalTasks");
const pendingTasks = document.getElementById("pendingTasks");
const completedTasks = document.getElementById("completedTasks");
const completionRate = document.getElementById("completionRate");
const progressPercent = document.getElementById("progressPercent");
const progressBar = document.getElementById("progressBar");
const todayLabel = document.getElementById("todayLabel");

let tasks = JSON.parse(localStorage.getItem("taskflowTasks")) || [];
let currentFilter = "all";

todayLabel.textContent = new Date().toLocaleDateString("en-IN", {
  weekday: "short",
  day: "numeric",
  month: "short"
});

function saveTasks() {
  localStorage.setItem("taskflowTasks", JSON.stringify(tasks));
}

function addTask(title, priority) {
  tasks.unshift({
    id: Date.now(),
    title,
    priority,
    completed: false
  });
  saveTasks();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  render();
}

function toggleTask(id) {
  tasks = tasks.map(task =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  saveTasks();
  render();
}

function getVisibleTasks() {
  if (currentFilter === "active") {
    return tasks.filter(task => !task.completed);
  }
  if (currentFilter === "completed") {
    return tasks.filter(task => task.completed);
  }
  return tasks;
}

function render() {
  const visibleTasks = getVisibleTasks();

  taskList.innerHTML = "";

  visibleTasks.forEach(task => {
    const item = document.createElement("div");
    item.className = "task-item";

    item.innerHTML = `
      <input class="check" type="checkbox" ${task.completed ? "checked" : ""}
        aria-label="Complete ${escapeHTML(task.title)}">
      <div class="task-content">
        <div class="task-title ${task.completed ? "done" : ""}">
          ${escapeHTML(task.title)}
        </div>
        <div class="task-meta">
          <span class="priority ${task.priority.toLowerCase()}">${task.priority} priority</span>
        </div>
      </div>
      <button class="delete-btn" aria-label="Delete task">×</button>
    `;

    item.querySelector(".check").addEventListener("change", () => toggleTask(task.id));
    item.querySelector(".delete-btn").addEventListener("click", () => deleteTask(task.id));

    taskList.appendChild(item);
  });

  emptyState.style.display = visibleTasks.length ? "none" : "block";
  updateStats();
}

function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter(task => task.completed).length;
  const pending = total - completed;
  const rate = total ? Math.round((completed / total) * 100) : 0;

  totalTasks.textContent = total;
  pendingTasks.textContent = pending;
  completedTasks.textContent = completed;
  completionRate.textContent = `${rate}%`;
  progressPercent.textContent = `${rate}%`;
  progressBar.style.width = `${rate}%`;
}

function escapeHTML(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

taskForm.addEventListener("submit", event => {
  event.preventDefault();

  const title = taskInput.value.trim();
  if (!title) return;

  addTask(title, priorityInput.value);
  taskInput.value = "";
  taskInput.focus();
});

document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");
    currentFilter = button.dataset.filter;
    render();
  });
});

clearCompleted.addEventListener("click", () => {
  tasks = tasks.filter(task => !task.completed);
  saveTasks();
  render();
});

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const dark = document.body.classList.contains("dark");
  localStorage.setItem("taskflowDarkMode", dark);
  themeToggle.textContent = dark ? "☀️" : "🌙";
});

if (localStorage.getItem("taskflowDarkMode") === "true") {
  document.body.classList.add("dark");
  themeToggle.textContent = "☀️";
}

render();
