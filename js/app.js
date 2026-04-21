// Index page: problem list

const SOLVED_KEY = 'pycoder_solved';

function getSolved() {
  try { return new Set(JSON.parse(localStorage.getItem(SOLVED_KEY)) || []); }
  catch { return new Set(); }
}

function diffLabel(d) {
  const map = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };
  return map[d] || d;
}

function renderList(filter) {
  const solved = getSolved();
  const tbody = document.getElementById('problem-list');
  tbody.innerHTML = '';

  const problems = filter === 'all'
    ? window.PROBLEMS
    : window.PROBLEMS.filter(p => p.difficulty === filter);

  problems.forEach(p => {
    const isSolved = solved.has(p.id);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.id}</td>
      <td><a href="problem.html?id=${p.id}">${p.title}</a></td>
      <td><span class="difficulty-badge ${p.difficulty}">${diffLabel(p.difficulty)}</span></td>
      <td><span class="status-icon ${isSolved ? 'solved' : ''}">${isSolved ? '✓' : '—'}</span></td>
    `;
    tr.addEventListener('click', () => location.href = `problem.html?id=${p.id}`);
    tbody.appendChild(tr);
  });
}

function updateStats() {
  const solved = getSolved();
  document.getElementById('stat-solved').textContent = solved.size;
  document.getElementById('stat-total').textContent  = window.PROBLEMS.length;
}

document.addEventListener('DOMContentLoaded', () => {
  let currentFilter = 'all';
  renderList(currentFilter);
  updateStats();

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderList(currentFilter);
    });
  });
});
