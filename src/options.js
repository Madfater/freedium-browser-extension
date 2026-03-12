// === Constants ===
const DEFAULT_DOMAIN = 'https://freedium-mirror.cfd';

// === State ===
let currentPatterns = [];
let currentMode = 'whitelist';
let currentDomain = DEFAULT_DOMAIN;

// === DOM Elements ===
const domainInput = () => document.getElementById('domainInput');
const btnReset = () => document.getElementById('btnReset');
const modeHint = () => document.getElementById('modeHint');
const patternCount = () => document.getElementById('patternCount');
const btnManage = () => document.getElementById('btnManage');
const btnAddDomain = () => document.getElementById('btnAddDomain');

// === Mode Hint Text ===
const MODE_HINTS = {
  whitelist: 'Show context menu only on medium.com and matching URLs',
  blacklist: 'Show context menu on all pages, except matching URLs',
};

// === Data Migration ===
/** Migrate v1 data to v2 format */
const migrateIfNeeded = (items) => {
  if (items.schemaVersion === 2) {
    return items;
  }

  const oldPatterns = items.patterns || '';
  const newPatterns =
    typeof oldPatterns === 'string'
      ? oldPatterns
          .replace(/\r/g, '')
          .split('\n')
          .map((p) => p.trim())
          .filter((p) => p)
      : Array.isArray(oldPatterns)
        ? oldPatterns
        : [];

  const migrated = {
    freediumDomain: items.freediumDomain || DEFAULT_DOMAIN,
    filterMode: items.filterMode || 'whitelist',
    patterns: newPatterns,
    schemaVersion: 2,
  };

  chrome.storage.sync.set(migrated);
  return migrated;
};

// === Save & Notify ===
const saveAndNotify = () => {
  const data = {
    freediumDomain: currentDomain,
    filterMode: currentMode,
    patterns: currentPatterns,
    schemaVersion: 2,
  };
  chrome.storage.sync.set(data, () => {
    chrome.runtime.sendMessage({ message: 'settingsSaved' });
  });
};

// === UI Updates ===
const updatePatternCount = () => {
  const count = currentPatterns.length;
  patternCount().textContent =
    count === 0
      ? 'No custom patterns'
      : `${count} custom pattern${count > 1 ? 's' : ''}`;
};

const updateModeUI = () => {
  modeHint().textContent = MODE_HINTS[currentMode];
  document.querySelectorAll('.segment-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.mode === currentMode);
  });
};

// === Mode Toggle ===
const toggleFilterMode = (mode) => {
  if (mode === currentMode) return;
  currentMode = mode;
  updateModeUI();
  saveAndNotify();
};

// === Domain Change ===
const onDomainChange = () => {
  const value = domainInput().value.trim();
  if (!value || !/^https?:\/\/.+/.test(value)) return;

  currentDomain = value.replace(/\/+$/, '');
  domainInput().value = currentDomain;
  saveAndNotify();
};

const resetDomain = () => {
  currentDomain = DEFAULT_DOMAIN;
  domainInput().value = currentDomain;
  saveAndNotify();
};

// === Add Current Domain ===
const addCurrentDomainToPatterns = () => {
  const btn = btnAddDomain();
  const originalText = btn.textContent;

  const resetBtn = () => {
    btn.disabled = false;
    btn.textContent = originalText;
  };

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0] || !tabs[0].url) return;

    let hostname;
    try {
      hostname = new URL(tabs[0].url).hostname;
    } catch {
      return;
    }

    if (!hostname) return;

    const pattern = `*://${hostname}/*`;

    if (currentPatterns.some((p) => p.toLowerCase() === pattern.toLowerCase())) {
      btn.disabled = true;
      btn.textContent = 'Already in patterns';
      setTimeout(resetBtn, 1500);
      return;
    }

    currentPatterns.push(pattern);
    updatePatternCount();
    saveAndNotify();

    btn.textContent = `Added ${hostname}!`;
    btn.disabled = true;
    setTimeout(resetBtn, 1500);
  });
};

// === Open Manage Page ===
const openManagePage = () => {
  // 通知 background 開啟 patterns 視窗並管理 popup 狀態
  chrome.runtime.sendMessage({
    message: 'openPatterns',
    screenWidth: screen.width,
    screenHeight: screen.height,
  });
  window.close();
};

// === Initialize ===
const restoreOptions = () => {
  chrome.storage.sync.get(
    {
      patterns: '',
      freediumDomain: DEFAULT_DOMAIN,
      filterMode: 'whitelist',
      schemaVersion: undefined,
    },
    (items) => {
      const settings = migrateIfNeeded(items);

      currentDomain = settings.freediumDomain;
      currentMode = settings.filterMode;
      currentPatterns = settings.patterns;

      domainInput().value = currentDomain;
      updateModeUI();
      updatePatternCount();
    }
  );
};

// === Event Bindings ===
document.addEventListener('DOMContentLoaded', () => {
  restoreOptions();

  domainInput().addEventListener('blur', onDomainChange);
  domainInput().addEventListener('keydown', (e) => {
    if (e.key === 'Enter') e.target.blur();
  });
  btnReset().addEventListener('click', resetDomain);
  btnAddDomain().addEventListener('click', addCurrentDomainToPatterns);

  document.querySelectorAll('.segment-btn').forEach((btn) => {
    btn.addEventListener('click', () => toggleFilterMode(btn.dataset.mode));
  });

  btnManage().addEventListener('click', openManagePage);
});
