// === Constants ===
const DEFAULT_DOMAIN = 'https://freedium-mirror.cfd';

// === State ===
let currentPatterns = [];

// === DOM Elements ===
const patternList = () => document.getElementById('patternList');
const patternListInfo = () => document.getElementById('patternListInfo');
const addInput = () => document.getElementById('addInput');
const btnAdd = () => document.getElementById('btnAdd');
const addError = () => document.getElementById('addError');

// === Save & Notify ===
/** Read current settings, update patterns, write back and notify background */
const savePatterns = () => {
  chrome.storage.sync.get(
    {
      freediumDomain: DEFAULT_DOMAIN,
      filterMode: 'whitelist',
      schemaVersion: 2,
    },
    (items) => {
      chrome.storage.sync.set(
        {
          freediumDomain: items.freediumDomain,
          filterMode: items.filterMode,
          patterns: currentPatterns,
          schemaVersion: 2,
        },
        () => {
          chrome.runtime.sendMessage({ message: 'settingsSaved' });
        }
      );
    }
  );
};

// === Normalize Patterns ===
const normalizePatterns = (patterns) => {
  if (typeof patterns === 'string') {
    return patterns
      .replace(/\r/g, '')
      .split('\n')
      .map((p) => p.trim())
      .filter((p) => p);
  }
  return Array.isArray(patterns) ? patterns : [];
};

// === Render ===
const renderPatternList = () => {
  const list = patternList();
  const info = patternListInfo();
  list.innerHTML = '';

  if (currentPatterns.length === 0) {
    const hint = document.createElement('div');
    hint.className = 'empty-hint';
    hint.textContent = 'No custom patterns';
    list.appendChild(hint);
    info.textContent = '';
    return;
  }

  currentPatterns.forEach((pattern, index) => {
    const item = document.createElement('div');
    item.className = 'pattern-item';

    const text = document.createElement('span');
    text.textContent = pattern;

    const btn = document.createElement('button');
    btn.className = 'btn-remove';
    btn.textContent = '-';
    btn.title = 'Remove';
    btn.addEventListener('click', () => removePattern(index));

    item.appendChild(text);
    item.appendChild(btn);
    list.appendChild(item);
  });

  const total = currentPatterns.length;
  info.textContent =
    total > 10
      ? `${total} patterns (scroll to see all)`
      : `${total} pattern${total > 1 ? 's' : ''}`;
};

// === Pattern Operations ===
const addPattern = () => {
  const input = addInput();
  const error = addError();
  const value = input.value.trim();

  if (!value) {
    error.textContent = '';
    return;
  }

  // Check for duplicates (case-insensitive)
  if (currentPatterns.some((p) => p.toLowerCase() === value.toLowerCase())) {
    error.textContent = 'This pattern already exists';
    return;
  }

  error.textContent = '';
  currentPatterns.push(value);
  input.value = '';

  renderPatternList();
  savePatterns();
};

const removePattern = (index) => {
  currentPatterns.splice(index, 1);
  renderPatternList();
  savePatterns();
};

// === Initialize ===
const restorePatterns = () => {
  chrome.storage.sync.get({ patterns: [] }, (items) => {
    currentPatterns = normalizePatterns(items.patterns);
    renderPatternList();
  });
};

// === Event Bindings ===
document.addEventListener('DOMContentLoaded', () => {
  restorePatterns();

  btnAdd().addEventListener('click', addPattern);
  addInput().addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addPattern();
  });
});
