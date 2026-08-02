/* Todo App
   HTML, CSS, JavaScript
   Features: Add, Edit, Delete, Search, Local Storage
*/

const STORAGE_KEY = 'etm.tasks.v1';
const SEQ_KEY = 'etm.sequence.v1';

/* ---------- State ---------- */
let tasks = loadTasks();
let searchTerm = '';
let editingId = null;

/* ---------- Persistence ---------- */
function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to read saved tasks, starting fresh.', e);
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function nextTicketKey() {
  const n = parseInt(localStorage.getItem(SEQ_KEY) || '0', 10) + 1;
  localStorage.setItem(SEQ_KEY, String(n));
  return `ETM-${n}`;
}

/* ---------- DOM refs ---------- */
const lists = {
  todo: document.getElementById('list-todo'),
  progress: document.getElementById('list-progress'),
  done: document.getElementById('list-done'),
};
const counts = {
  todo: document.getElementById('count-todo'),
  progress: document.getElementById('count-progress'),
  done: document.getElementById('count-done'),
};
const statTotal = document.getElementById('stat-total');
const statOpen = document.getElementById('stat-open');
const statDone = document.getElementById('stat-done');

const modalVeil = document.getElementById('modal-veil');
const modalTitle = document.getElementById('modal-title');
const modalSubmit = document.getElementById('modal-submit');
const ticketForm = document.getElementById('ticket-form');
const ticketText = document.getElementById('ticket-text');
const ticketPriority = document.getElementById('ticket-priority');
const ticketIdEdit = document.getElementById('ticket-id-edit');
const searchInput = document.getElementById('search-input');
const emptyTemplate = document.getElementById('empty-template');

/* ---------- Rendering ---------- */
function render() {
  const term = searchTerm.trim().toLowerCase();

  ['todo', 'progress', 'done'].forEach((status) => {
    lists[status].innerHTML = '';
  });

  const visible = tasks.filter((t) =>
    !term || t.text.toLowerCase().includes(term) || t.key.toLowerCase().includes(term)
  );

  ['todo', 'progress', 'done'].forEach((status) => {
    const items = visible.filter((t) => t.status === status);
    if (items.length === 0) {
      lists[status].appendChild(emptyTemplate.content.cloneNode(true));
    } else {
      items.forEach((task) => lists[status].appendChild(buildCard(task)));
    }
    counts[status].textContent = tasks.filter((t) => t.status === status).length;
  });

  statTotal.textContent = tasks.length;
  statDone.textContent = tasks.filter((t) => t.status === 'done').length;
  statOpen.textContent = tasks.filter((t) => t.status !== 'done').length;

  saveTasks();
}

function buildCard(task) {
  const card = document.createElement('div');
  card.className = 'card' + (task.status === 'done' ? ' card--done' : '');
  card.draggable = true;
  card.dataset.id = task.id;

  card.innerHTML = `
    <div class="card__top">
      <span class="card__id">${task.key}</span>
      <span class="card__priority card__priority--${task.priority}">${task.priority}</span>
    </div>
    <div class="card__body">
      <input type="checkbox" class="card__check" ${task.status === 'done' ? 'checked' : ''} title="Mark done">
      <span class="card__text"></span>
    </div>
    <div class="card__foot">
      <button class="card__action card__action--edit">Edit</button>
      <button class="card__action card__action--danger">Delete</button>
    </div>
  `;
  // set text safely (avoid HTML injection)
  card.querySelector('.card__text').textContent = task.text;

  card.querySelector('.card__check').addEventListener('change', (e) => {
    task.status = e.target.checked ? 'done' : 'todo';
    render();
  });
  card.querySelector('.card__action--edit').addEventListener('click', () => openEditModal(task.id));
  card.querySelector('.card__action--danger').addEventListener('click', () => deleteTask(task.id));

  card.addEventListener('dragstart', () => {
    card.classList.add('dragging');
    card.dataset.dragging = 'true';
  });
  card.addEventListener('dragend', () => {
    card.classList.remove('dragging');
  });

  return card;
}

/* ---------- CRUD ---------- */
function addTask(text, priority) {
  tasks.push({
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
    key: nextTicketKey(),
    text: text.trim(),
    priority,
    status: 'todo',
    createdAt: Date.now(),
  });
  render();
}

function updateTask(id, text, priority) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;
  task.text = text.trim();
  task.priority = priority;
  render();
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  render();
}

/* ---------- Modal ---------- */
function openAddModal() {
  editingId = null;
  modalTitle.textContent = 'New ticket';
  modalSubmit.textContent = 'Add ticket';
  ticketText.value = '';
  ticketPriority.value = 'medium';
  ticketIdEdit.value = '';
  modalVeil.classList.add('open');
  setTimeout(() => ticketText.focus(), 30);
}

function openEditModal(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;
  editingId = id;
  modalTitle.textContent = `Edit ${task.key}`;
  modalSubmit.textContent = 'Save changes';
  ticketText.value = task.text;
  ticketPriority.value = task.priority;
  ticketIdEdit.value = id;
  modalVeil.classList.add('open');
  setTimeout(() => ticketText.focus(), 30);
}

function closeModal() {
  modalVeil.classList.remove('open');
  editingId = null;
}

document.getElementById('open-add-modal').addEventListener('click', openAddModal);
document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal-cancel').addEventListener('click', closeModal);
modalVeil.addEventListener('click', (e) => {
  if (e.target === modalVeil) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalVeil.classList.contains('open')) closeModal();
});

ticketForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = ticketText.value.trim();
  if (!text) return;
  const priority = ticketPriority.value;

  if (editingId) {
    updateTask(editingId, text, priority);
  } else {
    addTask(text, priority);
  }
  closeModal();
});

/* ---------- Search ---------- */
searchInput.addEventListener('input', (e) => {
  searchTerm = e.target.value;
  render();
});

/* ---------- Drag & drop between columns ---------- */
Object.entries(lists).forEach(([status, el]) => {
  el.addEventListener('dragover', (e) => {
    e.preventDefault();
    el.classList.add('drag-over');
  });
  el.addEventListener('dragleave', () => el.classList.remove('drag-over'));
  el.addEventListener('drop', (e) => {
    e.preventDefault();
    el.classList.remove('drag-over');
    const dragging = document.querySelector('.card.dragging');
    if (!dragging) return;
    const id = dragging.dataset.id;
    const task = tasks.find((t) => t.id === id);
    if (task) {
      task.status = status;
      render();
    }
  });
});

/* ---------- Init ---------- */
render();
