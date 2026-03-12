// === Constants ===
const DEFAULT_DOMAIN = 'https://freedium-mirror.cfd';
const DEFAULT_PATTERNS = ['*://*.medium.com/*', '*://medium.com/*'];

// === Utilities ===

/** Normalize patterns from legacy string format to array */
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

/**
 * Convert a URL match pattern to RegExp
 * e.g. *://*.example.com/* -> /^.*:\/\/.*\.example\.com\/.*$/
 */
const matchPatternToRegex = (pattern) => {
  const escaped = pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\\\*/g, '.*');
  return new RegExp('^' + escaped + '$');
};

// === Context Menu Setup ===

/** Create context menu items with optional URL pattern filtering */
const createMenuItems = (patterns) => {
  const linkProps = {
    title: 'Open in Freedium',
    type: 'normal',
    id: 'freedium-link',
    contexts: ['link'],
  };
  const pageProps = {
    title: 'Open in Freedium',
    type: 'normal',
    id: 'freedium-page',
    contexts: ['page'],
  };

  // Only set URL pattern filters in whitelist mode
  if (patterns) {
    linkProps.targetUrlPatterns = patterns;
    pageProps.documentUrlPatterns = patterns;
  }

  chrome.contextMenus.create(linkProps);
  chrome.contextMenus.create(pageProps);
};

/** Set up context menus based on current settings */
const setUpContextMenus = () => {
  chrome.storage.sync.get(
    { patterns: [], filterMode: 'whitelist' },
    (items) => {
      const userPatterns = normalizePatterns(items.patterns);
      const mode = items.filterMode || 'whitelist';

      if (mode === 'whitelist') {
        // Whitelist mode: show context menu only on matching URLs
        const allPatterns = DEFAULT_PATTERNS.concat(userPatterns);
        createMenuItems(allPatterns);
      } else {
        // Blacklist mode: show on all pages, filter on click
        createMenuItems(null);
      }
    }
  );
};

// === Open in Freedium ===

/**
 * Open a URL in Freedium
 * @param {string} url - The original URL
 * @param {boolean} newTab - Whether to open in a new tab
 */
const openInFreedium = (url, newTab) => {
  if (!url) return;

  chrome.storage.sync.get(
    { freediumDomain: DEFAULT_DOMAIN },
    (items) => {
      const domain = (items.freediumDomain || DEFAULT_DOMAIN).replace(/\/+$/, '');
      const targetUrl = domain + '/' + url;

      if (newTab) {
        chrome.tabs.create({ url: targetUrl });
      } else {
        chrome.tabs.update({ url: targetUrl });
      }
    }
  );
};

// === Event Listeners ===

// Initialize context menus on extension install/update
chrome.runtime.onInstalled.addListener(() => {
  setUpContextMenus();
});

// Rebuild context menus when settings are saved
chrome.runtime.onMessage.addListener((request) => {
  if (request.message === 'settingsSaved') {
    chrome.contextMenus.removeAll(() => {
      setUpContextMenus();
    });
  }

  // 開啟 patterns 視窗，禁用 popup，關閉後恢復
  if (request.message === 'openPatterns') {
    const width = 640;
    const height = 520;
    const left = Math.round((request.screenWidth - width) / 2);
    const top = Math.round((request.screenHeight - height) / 2);

    // 禁用 popup（點擊 extension icon 無反應）
    chrome.action.setPopup({ popup: '' });

    chrome.windows.create(
      {
        url: chrome.runtime.getURL('src/patterns.html'),
        type: 'popup',
        width,
        height,
        left,
        top,
      },
      (patternsWin) => {
        // 監聽 patterns 視窗關閉
        chrome.windows.onRemoved.addListener(function onClosed(windowId) {
          if (windowId === patternsWin.id) {
            chrome.windows.onRemoved.removeListener(onClosed);
            // 恢復 popup
            chrome.action.setPopup({ popup: 'src/options.html' });
          }
        });
      }
    );
  }
});

// Handle context menu click events
chrome.contextMenus.onClicked.addListener((item) => {
  const isLink = item.menuItemId === 'freedium-link';
  const url = isLink ? item.linkUrl : item.pageUrl;

  if (!url) return;

  chrome.storage.sync.get(
    { filterMode: 'whitelist', patterns: [] },
    (items) => {
      const mode = items.filterMode || 'whitelist';

      if (mode === 'blacklist') {
        // Blacklist mode: check if URL is excluded
        const userPatterns = normalizePatterns(items.patterns);
        const isBlocked = userPatterns.some((p) =>
          matchPatternToRegex(p).test(url)
        );
        if (isBlocked) return;
      }

      // Whitelist mode is already filtered by Chrome API
      openInFreedium(url, isLink);
    }
  );
});
