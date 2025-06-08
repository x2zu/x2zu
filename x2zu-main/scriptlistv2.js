const backBtn = document.getElementById('back-btn');
const searchInput = document.getElementById('search-input');
const scriptGrid = document.getElementById('script-grid');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const paginationInfo = document.getElementById('pagination-info');
const modalBg = document.getElementById('modal-bg');
const modalWindow = document.getElementById('modal-window');
const modalText = document.getElementById('modal-text');
const modalTitle = document.getElementById('modal-title');
const closeBtn = document.getElementById('close-btn');
const copyBtn = document.getElementById('copy-btn');

const API_BASE_URL = 'http://187.33.145.39:3389';
const SCRIPT_ENDPOINT = `${API_BASE_URL}/scripts`;
const SCRIPT_DETAILS_ENDPOINT = `${API_BASE_URL}/script`;

let currentPage = 1;
let totalScripts = 0;
let perPage = 9;
let currentSearch = "";

const scriptCache = new Map();

backBtn.addEventListener('click', () => {
  window.location.href = 'https://x2zu.vercel.app/';
});

function openModal(text, title = 'SOURCE OF SCRIPT') {
  modalText.value = text;
  modalTitle.textContent = title;
  modalBg.classList.add('visible');
  setTimeout(() => {
    modalWindow.classList.add('open');
    modalBg.setAttribute('aria-hidden', 'false');
    modalWindow.focus();
  }, 10);
}

function closeModal() {
  modalWindow.classList.remove('open');
  modalBg.setAttribute('aria-hidden', 'true');
  setTimeout(() => {
    modalBg.classList.remove('visible');
    modalText.value = '';
    modalTitle.textContent = 'SOURCE OF SCRIPT';
  }, 350);
}

closeBtn.addEventListener('click', closeModal);
modalBg.addEventListener('click', e => {
  if (e.target === modalBg) closeModal();
});
window.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modalBg.classList.contains('visible')) {
    closeModal();
  }
});

copyBtn.addEventListener('click', () => {
  modalText.select();
  modalText.setSelectionRange(0, modalText.value.length);
  navigator.clipboard.writeText(modalText.value)
    .then(() => {
      copyBtn.classList.add('copied');
      setTimeout(() => copyBtn.classList.remove('copied'), 1200);
    })
    .catch(() => alert("Failed to copy."));
});

function debounce(func, wait = 300) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

function renderScripts(scripts) {
  scriptGrid.innerHTML = '';
  if (!scripts.length) {
    scriptGrid.innerHTML = '<p style="text-align:center; color:#777; font-weight:600;">No scripts found.</p>';
    return;
  }
  scripts.forEach(({ name, size }) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-pressed', 'false');
    card.innerHTML = `
      <div class="thumb">
        <img src="x2zu.jpg" alt="Thumbnail for ${name}" />
      </div>
      <h3>${name}</h3>
      <small>${(size / 1024).toFixed(2)} KB</small>
    `;
    const openScript = () => loadAndShowScript(name);
    card.addEventListener('click', openScript);
    card.addEventListener('keypress', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openScript();
      }
    });
    scriptGrid.appendChild(card);
  });
}

async function loadAndShowScript(name) {
  if (scriptCache.has(name)) {
    openModal(scriptCache.get(name), name);
    return;
  }
  openModal("Loading...", "");
  try {
    const response = await axios.get(`${SCRIPT_DETAILS_ENDPOINT}/${encodeURIComponent(name)}`);
    scriptCache.set(name, response.data.code);
    openModal(response.data.code, name);
  } catch (error) {
    console.error('Error loading script:', error);
    openModal("Failed to load script.", "");
  }
}

async function fetchScripts(page = 1, search = "") {
  scriptGrid.innerHTML = "<p style='text-align:center; color:#777;'>Loading...</p>";
  try {
    const response = await axios.get(SCRIPT_ENDPOINT, {
      params: { page, per_page: perPage, search }
    });
    const data = response.data;
    totalScripts = data.total;
    currentPage = data.page;
    renderScripts(data.scripts);
    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = currentPage * perPage >= totalScripts;
    prevPageBtn.setAttribute('aria-disabled', prevPageBtn.disabled);
    nextPageBtn.setAttribute('aria-disabled', nextPageBtn.disabled);
    paginationInfo.textContent = `Page ${currentPage} of ${Math.ceil(totalScripts / perPage)}`;
  } catch (error) {
    scriptGrid.innerHTML = '<p style="text-align:center; color:#f55;">Error loading scripts.</p>';
    console.error("Error fetching scripts:", error);
  }
}

prevPageBtn.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    fetchScripts(currentPage, currentSearch);
  }
});
nextPageBtn.addEventListener('click', () => {
  if (currentPage * perPage < totalScripts) {
    currentPage++;
    fetchScripts(currentPage, currentSearch);
  }
});

searchInput.addEventListener('input', debounce(() => {
  currentSearch = searchInput.value.trim();
  currentPage = 1;
  fetchScripts(currentPage, currentSearch);
}, 400));

fetchScripts(currentPage, currentSearch);
