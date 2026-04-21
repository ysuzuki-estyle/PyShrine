// Problem editor page: Monaco + Pyodide

let editor = null;
let pyodide = null;
let problem = null;
let isRunning = false;

// ── Pyodide ──────────────────────────────────────────────────────────────────

async function initPyodide() {
  setStatus('loading');
  try {
    pyodide = await loadPyodide();
    setStatus('ready');
    log('Python (Pyodide) の読み込みが完了しました', 'success');
    enableButtons();
  } catch (e) {
    setStatus('error');
    log('Pyodide の読み込みに失敗しました: ' + e.message, 'error');
  }
}

function setStatus(state) {
  const el = document.getElementById('pyodide-status');
  const dot = el.querySelector('.dot');
  const txt = el.querySelector('.status-text');
  if (state === 'loading') { el.className = 'pyodide-status'; txt.textContent = 'Python 読み込み中...'; }
  if (state === 'ready')   { el.className = 'pyodide-status ready'; txt.textContent = 'Python 準備完了'; }
  if (state === 'error')   { el.className = 'pyodide-status'; txt.textContent = 'Python 読み込み失敗'; dot.style.background = 'var(--fail)'; dot.style.animation = 'none'; }
}

// ── Monaco Editor ─────────────────────────────────────────────────────────────

function initMonaco(starterCode) {
  require.config({
    paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' }
  });
  require(['vs/editor/editor.main'], () => {
    monaco.editor.defineTheme('pycoder-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#0f1117',
        'editor.lineHighlightBackground': '#1a1d27',
        'editorLineNumber.foreground': '#4a5568',
        'editorLineNumber.activeForeground': '#7c8ba1',
      }
    });

    editor = monaco.editor.create(document.getElementById('monaco-editor'), {
      value: starterCode,
      language: 'python',
      theme: 'pycoder-dark',
      fontSize: 14,
      fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
      lineNumbers: 'on',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 4,
      insertSpaces: true,
      wordWrap: 'on',
      padding: { top: 12, bottom: 12 },
    });

    document.getElementById('btn-reset').addEventListener('click', () => {
      if (confirm('コードをリセットしますか？')) {
        editor.setValue(problem.starterCode);
      }
    });
  });
}

// ── Test runner ───────────────────────────────────────────────────────────────

function buildPythonRunner(userCode, testCases) {
  const testData = JSON.stringify(testCases.map(tc => ({
    id: tc.id,
    callExpr: tc.callExpr,
    expected: tc.expected,
    inputDisplay: tc.inputDisplay,
  })));

  return `
import json as _json
import sys as _sys
from io import StringIO as _StringIO
import traceback as _traceback

_buf = _StringIO()
_sys.stdout = _buf
_output = {}

try:
${userCode.split('\n').map(l => '    ' + l).join('\n')}

    _test_data = _json.loads('''${testData}''')
    _results = []
    for _tc in _test_data:
        _tc_buf = _StringIO()
        _sys.stdout = _tc_buf
        try:
            _actual = eval(_tc['callExpr'])
            _expected = _tc['expected']
            _results.append({
                'id': _tc['id'],
                'passed': _actual == _expected,
                'actual': repr(_actual),
                'expected': repr(_expected),
                'inputDisplay': _tc['inputDisplay'],
                'stdout': _tc_buf.getvalue(),
            })
        except Exception as _e:
            _results.append({
                'id': _tc['id'],
                'passed': False,
                'error': str(_e),
                'inputDisplay': _tc['inputDisplay'],
                'stdout': _tc_buf.getvalue(),
            })
        finally:
            _sys.stdout = _buf
    _output['results'] = _results
except SyntaxError as _e:
    _output['syntaxError'] = f'SyntaxError: {_e}'
except Exception as _e:
    _output['runtimeError'] = _traceback.format_exc()
finally:
    _sys.stdout = _sys.__stdout__
    _output['stdout'] = _buf.getvalue()

_json.dumps(_output)
`.trim();
}

// ── Run / Submit ──────────────────────────────────────────────────────────────

async function runTests(mode) {
  if (!pyodide || isRunning) return;
  isRunning = true;
  disableButtons();
  hideBanner();
  clearConsole();

  const userCode = editor.getValue();
  const testCases = mode === 'submit'
    ? [...problem.testCases, ...problem.hiddenTestCases]
    : problem.testCases;

  // Show pending state
  renderPending(testCases);
  switchTab('results');

  log(`${mode === 'submit' ? '提出' : '実行'}中... (${testCases.length} テストケース)`, 'info');

  try {
    const pythonCode = buildPythonRunner(userCode, testCases);
    const raw = await pyodide.runPythonAsync(pythonCode);
    const output = JSON.parse(raw);

    if (output.stdout) log(output.stdout.trimEnd(), 'info');
    if (output.syntaxError) { log(output.syntaxError, 'error'); renderError(testCases, output.syntaxError); }
    else if (output.runtimeError) { log(output.runtimeError.trim(), 'error'); renderError(testCases, output.runtimeError); }
    else {
      const results = output.results || [];
      renderResults(results, mode);
      const allPass = results.every(r => r.passed);
      if (mode === 'submit') {
        if (allPass) {
          showBanner('accepted', `✓ Accepted — 全 ${results.length} テストケース通過`);
          markSolved(problem.id);
        } else {
          const fail = results.filter(r => !r.passed).length;
          showBanner('wrong', `✗ Wrong Answer — ${fail} / ${results.length} 失敗`);
        }
      } else {
        const pass = results.filter(r => r.passed).length;
        log(`${pass} / ${results.length} テストケース通過`, pass === results.length ? 'success' : 'error');
      }
    }
  } catch (e) {
    log('実行エラー: ' + e.message, 'error');
  }

  isRunning = false;
  enableButtons();
}

// ── UI helpers ────────────────────────────────────────────────────────────────

function renderPending(testCases) {
  const container = document.getElementById('test-results');
  container.innerHTML = '';
  testCases.forEach(tc => {
    container.insertAdjacentHTML('beforeend', `
      <div class="test-result-item pending" id="tc-${tc.id}">
        <div class="test-result-header">
          <span class="test-result-icon">⋯</span>
          <span class="test-result-name">ケース ${tc.id}: ${escapeHtml(tc.inputDisplay)}</span>
          <span class="test-result-status">実行中</span>
        </div>
      </div>
    `);
  });
}

function renderResults(results, mode) {
  const container = document.getElementById('test-results');
  container.innerHTML = '';
  results.forEach(r => {
    const cls  = r.passed ? 'pass' : 'fail';
    const icon = r.passed ? '✓' : '✗';
    const status = r.passed ? 'Passed' : 'Failed';
    const details = r.error
      ? `<div class="result-row"><div class="result-label">エラー</div><div class="result-value error-text">${escapeHtml(r.error)}</div></div>`
      : `
        <div class="result-row"><div class="result-label">入力</div><div class="result-value">${escapeHtml(r.inputDisplay)}</div></div>
        <div class="result-row"><div class="result-label">期待値</div><div class="result-value">${escapeHtml(r.expected)}</div></div>
        <div class="result-row"><div class="result-label">出力</div><div class="result-value ${r.passed ? '' : 'error-text'}">${escapeHtml(r.actual)}</div></div>
        ${r.stdout ? `<div class="result-row"><div class="result-label">標準出力</div><div class="result-value">${escapeHtml(r.stdout)}</div></div>` : ''}
      `;

    container.insertAdjacentHTML('beforeend', `
      <div class="test-result-item ${cls}">
        <div class="test-result-header" onclick="toggleDetails(this)">
          <span class="test-result-icon">${icon}</span>
          <span class="test-result-name">ケース ${r.id}: ${escapeHtml(r.inputDisplay)}</span>
          <span class="test-result-status">${status}</span>
        </div>
        <div class="test-result-details ${r.passed ? '' : 'open'}">${details}</div>
      </div>
    `);
  });
}

function renderError(testCases, msg) {
  const container = document.getElementById('test-results');
  container.innerHTML = `
    <div class="test-result-item fail">
      <div class="test-result-header">
        <span class="test-result-icon">✗</span>
        <span class="test-result-name">コンパイル / 実行エラー</span>
        <span class="test-result-status">Error</span>
      </div>
      <div class="test-result-details open">
        <div class="result-row"><div class="result-value error-text">${escapeHtml(msg)}</div></div>
      </div>
    </div>
  `;
}

window.toggleDetails = function(header) {
  const details = header.nextElementSibling;
  details.classList.toggle('open');
};

function log(msg, type = '') {
  const out = document.getElementById('console-output');
  const line = document.createElement('div');
  line.className = 'console-line ' + type;
  line.textContent = msg;
  out.appendChild(line);
  out.scrollTop = out.scrollHeight;
}

function clearConsole() {
  document.getElementById('console-output').innerHTML = '';
}

function showBanner(type, msg) {
  const b = document.getElementById('result-banner');
  b.className = 'result-banner show ' + type;
  b.textContent = msg;
}

function hideBanner() {
  document.getElementById('result-banner').className = 'result-banner';
}

function enableButtons() {
  document.getElementById('btn-run').disabled    = false;
  document.getElementById('btn-submit').disabled = false;
}

function disableButtons() {
  document.getElementById('btn-run').disabled    = true;
  document.getElementById('btn-submit').disabled = true;
}

function switchTab(name) {
  document.querySelectorAll('.problem-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name));
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.toggle('active', p.id === 'tab-' + name));
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function markSolved(id) {
  try {
    const set = new Set(JSON.parse(localStorage.getItem('pycoder_solved')) || []);
    set.add(id);
    localStorage.setItem('pycoder_solved', JSON.stringify([...set]));
  } catch {}
}

// ── Init ──────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(location.search);
  const id = parseInt(params.get('id'), 10);
  problem = window.PROBLEMS.find(p => p.id === id);

  if (!problem) {
    document.body.innerHTML = '<div style="padding:40px;color:#e2e8f0">問題が見つかりません。<a href="index.html" style="color:#6366f1">一覧へ戻る</a></div>';
    return;
  }

  // Header
  document.getElementById('problem-title').textContent  = `${problem.id}. ${problem.title}`;
  document.title = `${problem.id}. ${problem.title} — PyCoder`;

  // Description
  document.getElementById('prob-title').textContent = `${problem.id}. ${problem.title}`;
  const diffEl = document.getElementById('prob-difficulty');
  diffEl.textContent = { easy:'Easy', medium:'Medium', hard:'Hard' }[problem.difficulty];
  diffEl.className = `difficulty-badge ${problem.difficulty}`;

  document.getElementById('prob-description').innerHTML =
    problem.description.replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\n/g, '<br>');

  const examplesEl = document.getElementById('prob-examples');
  problem.examples.forEach((ex, i) => {
    examplesEl.insertAdjacentHTML('beforeend', `
      <div class="example-block">
        <div class="label">例 ${i + 1} 入力</div><div class="value">${escapeHtml(ex.input)}</div>
        <div class="label" style="margin-top:6px">出力</div><div class="value">${escapeHtml(ex.output)}</div>
      </div>
    `);
  });

  const constraintsEl = document.getElementById('prob-constraints');
  problem.constraints.forEach(c => {
    constraintsEl.insertAdjacentHTML('beforeend', `<li>${escapeHtml(c)}</li>`);
  });

  // Tabs
  document.querySelectorAll('.problem-tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  // Buttons
  document.getElementById('btn-run').addEventListener('click',    () => runTests('run'));
  document.getElementById('btn-submit').addEventListener('click', () => runTests('submit'));
  document.getElementById('console-clear').addEventListener('click', clearConsole);
  disableButtons();

  // Monaco
  initMonaco(problem.starterCode);

  // Pyodide (async)
  initPyodide();
});
