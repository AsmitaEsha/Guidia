const GUIDIA_APP_URL = 'http://localhost:5173';

function setStatus(root, text, isError = false) {
  const status = root.querySelector('.guidia-anywhere-status');
  status.textContent = text;
  status.style.background = isError ? '#8b1e1e' : '#123';
  status.classList.add('show');
  if (!isError) {
    setTimeout(() => status.classList.remove('show'), 3200);
  }
}

function createGuidiaButton() {
  if (document.getElementById('guidia-anywhere-root')) return;

  chrome.storage.local.get(['guidiaAnywhereHidden', 'guidiaAnywhereConsent'], (stored) => {
    if (stored.guidiaAnywhereHidden) return;

    const root = document.createElement('div');
    root.id = 'guidia-anywhere-root';
    root.innerHTML = `
      <div class="guidia-anywhere-card">
        <button class="guidia-anywhere-main" title="Ask Guidia about this page" type="button">
          <span>Guidia ✦<small>Screenshot</small></span>
        </button>
        <div class="guidia-anywhere-menu" aria-label="Guidia menu">
          <button type="button" data-action="capture">Take Screenshot</button>
          <a href="${GUIDIA_APP_URL}/app/home" target="_blank" rel="noreferrer">Open Guidia</a>
          <button type="button" data-action="hide">Hide Guidia Button</button>
        </div>
        <div class="guidia-anywhere-status" role="status"></div>
      </div>
    `;
    document.body.appendChild(root);

    const main = root.querySelector('.guidia-anywhere-main');
    const menu = root.querySelector('.guidia-anywhere-menu');
    main.addEventListener('click', () => menu.classList.toggle('open'));

    root.querySelector('[data-action="hide"]').addEventListener('click', () => {
      chrome.storage.local.set({ guidiaAnywhereHidden: true });
      root.remove();
    });

    root.querySelector('[data-action="capture"]').addEventListener('click', () => {
      menu.classList.remove('open');
      chrome.storage.local.get(['guidiaAnywhereConsent'], (latest) => {
        if (!latest.guidiaAnywhereConsent) {
          const ok = window.confirm('Guidia will capture what is currently visible in this browser tab so it can explain the screen to you.');
          if (!ok) return;
          chrome.storage.local.set({ guidiaAnywhereConsent: true });
        }

        setStatus(root, 'Screenshot captured. Opening Guidia...');
        chrome.runtime.sendMessage({ type: 'GUIDIA_CAPTURE_VISIBLE_TAB' }, (response) => {
          if (chrome.runtime.lastError) {
            setStatus(root, "Guidia can't capture this browser page. Try using Guidia on a normal website.", true);
            return;
          }
          if (!response?.ok) {
            setStatus(root, response?.error || 'Guidia could not capture this page.', true);
          }
        });
      });
    });
  });
}

createGuidiaButton();
