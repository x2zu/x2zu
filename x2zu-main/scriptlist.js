const GITHUB_FOLDER_API = "https://api.github.com/repos/x2zu/OPEN-SOURCE-SCRIPT-ROBLOX/contents/OPEN%20SOURCE%20SCRIPT";

async function fetchScriptsFromGitHubFolder() {
  try {
    const response = await fetch(GITHUB_FOLDER_API);
    const files = await response.json();

    // Filter file .lua dan ubah ke struktur script yang bisa digunakan
    const scripts = files
      .filter(file => file.name.endsWith(".lua"))
      .map(file => ({
        name: file.name.replace(".lua", ""),
        game: "Unknown",
        category: "Uncategorized",
        description: "Auto-loaded from GitHub",
        code: file.download_url,
        popularity: Math.floor(Math.random() * 100),
        dateAdded: new Date().toISOString().split("T")[0],
      }));

    return scripts;
  } catch (error) {
    console.error("Failed to fetch scripts from GitHub folder:", error);
    return [];
  }
}
async function fetchScripts(page = 1, search = "") {
  scriptGrid.innerHTML = "<p style='text-align:center; color:#777;'>Loading...</p>";

  try {
    const allScripts = await fetchScriptsFromGitHubFolder();
    const filtered = allScripts.filter(script =>
      script.name.toLowerCase().includes(search.toLowerCase())
    );

    totalScripts = filtered.length;
    currentPage = page;
    const start = (currentPage - 1) * perPage;
    const end = start + perPage;
    const pageScripts = filtered.slice(start, end);

    renderScripts(pageScripts);
    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = currentPage * perPage >= totalScripts;
    paginationInfo.textContent = `Page ${currentPage} of ${Math.ceil(totalScripts / perPage)}`;
  } catch (error) {
    scriptGrid.innerHTML = '<p style="text-align:center; color:#f55;">Error loading scripts from GitHub.</p>';
  }
}

let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

const isFavorite = (scriptName) => {
    if (typeof scriptName !== 'string' || !scriptName.trim()) {
        console.warn('Invalid script name provided to isFavorite:', scriptName);
        return false;
    }
    return favorites.includes(scriptName.trim());
};

const toggleFavorite = (scriptName) => {
    if (typeof scriptName !== 'string' || !scriptName.trim()) {
        console.warn('Invalid script name for toggleFavorite:', scriptName);
        return;
    }
    scriptName = scriptName.trim();

    // Check if script exists
    const scriptExists = scripts.some(script => script.name === scriptName);
    if (!scriptExists) {
        console.warn(`Script '${scriptName}' not found in scripts array.`);
        return;
    }

    // Toggle favorite state
    const isCurrentlyFavorite = isFavorite(scriptName);
    if (isCurrentlyFavorite) {
        favorites = favorites.filter(name => name !== scriptName);
    } else {
        favorites.push(scriptName);
    }

    // Update localStorage
    try {
        localStorage.setItem('favorites', JSON.stringify(favorites));
    } catch (error) {
        console.error('Failed to update localStorage:', error);
        return;
    }

    // Update the specific favorite button
    const favoriteButtons = document.querySelectorAll(`.favorite-btn[onclick="toggleFavorite('${scriptName}')"]`);
    favoriteButtons.forEach(button => {
        button.innerHTML = isCurrentlyFavorite ? '<i class="far fa-heart"></i>' : '<i class="fas fa-heart"></i>';
        button.classList.toggle('favorited', !isCurrentlyFavorite);
        button.setAttribute('aria-label', isCurrentlyFavorite ? `Add ${scriptName} to favorites` : `Remove ${scriptName} from favorites`);
        button.classList.remove('animate');
        void button.offsetWidth; // Trigger reflow
        button.classList.add('animate');
    });

   // Refresh display only if favorites filter is active
const showFavorites = document.getElementById('showFavorites');
if (showFavorites && showFavorites.checked) {
    filterScripts();
}

};

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hide');
        setTimeout(() => {
            modal.style.display = 'none';
            modal.classList.remove('hide');
        }, 300);
    } else {
        console.warn(`Modal with ID '${modalId}' not found.`);
    }
}

function showCode(scriptName) {
    const script = scripts.find(s => s.name === scriptName);
    const modal = document.getElementById('scriptModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalGame = document.getElementById('modalGame');
    const modalDescription = document.getElementById('modalDescription');
    const modalCode = document.getElementById('modalCode');
    const modalContent = document.querySelector('#scriptModal .modal-content');

    if (!script || !modal || !modalTitle || !modalGame || !modalDescription || !modalCode || !modalContent) {
        console.error('Script or modal elements not found.');
        alert(`Script '${scriptName}' not found or modal elements missing.`);
        return;
    }

    modalTitle.textContent = script.name;
    modalGame.innerHTML = `<strong>Game:</strong> ${script.game} <br><strong>Category:</strong> ${script.category}`;
    modalDescription.textContent = script.description;
    modalCode.textContent = script.code;

    let copyButton = modalContent.querySelector('.copy-btn');
    if (!copyButton) {
        copyButton = document.createElement('button');
        copyButton.className = 'copy-btn';
        copyButton.innerHTML = '<i class="fas fa-copy"></i> Copy Code';
        copyButton.setAttribute('aria-label', 'Copy script code');
        modalContent.insertBefore(copyButton, modalContent.querySelector('pre'));
    }

    copyButton.onclick = () => {
        navigator.clipboard.writeText(script.code)
            .then(() => {
                copyButton.innerHTML = '<i class="fas fa-check"></i> Copied!';
                setTimeout(() => { copyButton.innerHTML = '<i class="fas fa-copy"></i> Copy Code'; }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy code:', err);
                alert('Failed to copy code. Please try again.');
            });
    };

    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
    modal.focus();
    hljs.highlightElement(modalCode);
}

document.addEventListener('DOMContentLoaded', () => {
    hljs.highlightAll();

    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', currentTheme);
        themeToggle.innerHTML = `<i class="fas fa-${currentTheme === 'light' ? 'moon' : 'sun'}"></i> ${currentTheme === 'light' ? 'Dark' : 'Light'} Mode`;
        localStorage.setItem('theme', currentTheme);
    });

    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeToggle.innerHTML = `<i class="fas fa-${savedTheme === 'light' ? 'moon' : 'sun'}"></i> ${savedTheme === 'light' ? 'Dark' : 'Light'} Mode`;

    // Overlay menu toggle
    const hamburger = document.querySelector('.hamburger');
    const overlayMenu = document.getElementById('overlayMenu');
    hamburger.addEventListener('click', () => {
        const isOpen = overlayMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
        hamburger.setAttribute('aria-expanded', isOpen.toString());
        overlayMenu.setAttribute('aria-hidden', (!isOpen).toString());
        if (isOpen) {
            overlayMenu.focus();
        }
    });

    // Close overlay when clicking outside
    overlayMenu.addEventListener('click', (e) => {
        if (e.target === overlayMenu) {
            overlayMenu.classList.remove('active');
            hamburger.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
            overlayMenu.setAttribute('aria-hidden', 'true');
        }
    });

    // Focus trap for overlay menu
    overlayMenu.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            const focusableElements = overlayMenu.querySelectorAll('a, button');
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (e.shiftKey && document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    });

    // Close overlay and modals on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            overlayMenu.classList.remove('active');
            hamburger.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
            overlayMenu.setAttribute('aria-hidden', 'true');
            closeModal('scriptModal');
            closeModal('aboutModal');
            closeModal('contactModal');
        }
    });

    // About modal toggle
    const aboutBtn = document.getElementById('aboutBtn');
    const aboutModal = document.getElementById('aboutModal');
    aboutBtn.addEventListener('click', () => {
        aboutModal.style.display = 'flex';
        aboutModal.setAttribute('aria-hidden', 'false');
        aboutModal.focus();
        overlayMenu.classList.remove('active');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        overlayMenu.setAttribute('aria-hidden', 'true');
    });

    // Contact modal toggle
    const contactBtn = document.getElementById('contactBtn');
    const contactModal = document.getElementById('contactModal');
    contactBtn.addEventListener('click', () => {
        contactModal.style.display = 'flex';
        contactModal.setAttribute('aria-hidden', 'false');
        contactModal.focus();
        overlayMenu.classList.remove('active');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        overlayMenu.setAttribute('aria-hidden', 'true');
    });

    // Modal click to close
    [document.getElementById('scriptModal'), aboutModal, contactModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });

    // Focus trap for modals
    [document.getElementById('scriptModal'), aboutModal, contactModal].forEach(modal => {
        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const focusableElements = modal.querySelectorAll('button, a, [tabindex="0"]');
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                } else if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        });
    });

    // Pagination
    let currentPage = 1;
    const scriptsPerPage = 40;

    // Utility function to debounce input events
    const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(null, args), delay);
        };
    };

    // Function to create a script card
    const createScriptCard = (script) => {
        const scriptCard = document.createElement('div');
        scriptCard.className = 'script-card';
        scriptCard.setAttribute('role', 'article');
        scriptCard.innerHTML = `
            <h3>${script.name}</h3>
            <p><strong>Game:</strong> ${script.game}</p>
            <p><strong>Category:</strong> ${script.category}</p>
            <p>${script.description}</p>
            <div class="buttons">
                <button onclick="showCode('${script.name}')" aria-label="View code for ${script.name}"><i class="fas fa-code"></i> View Code</button>
                <button class="favorite-btn${isFavorite(script.name) ? ' favorited' : ''}" onclick="toggleFavorite('${script.name}')" aria-label="${isFavorite(script.name) ? 'Remove from' : 'Add to'} favorites" data-script-name="${script.name}">
                    ${isFavorite(script.name) ? '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>'}
                </button>
            </div>
        `;
        return scriptCard;
    };

    // Function to display scripts with loading state
    const displayScripts = (scriptsToShow) => {
        const scriptsGrid = document.getElementById('scriptsGrid');
        const noResults = document.getElementById('noResults');
        const prevPage = document.getElementById('prevPage');
        const nextPage = document.getElementById('nextPage');
        const pageInfo = document.getElementById('pageInfo');

        if (!scriptsGrid || !noResults || !prevPage || !nextPage || !pageInfo) {
            console.error('Required DOM elements not found.');
            return;
        }

        scriptsGrid.style.opacity = '0.5';
        scriptsGrid.innerHTML = '<div class="loading"><i class="fas fa-spinner"></i> Loading scripts...</div>';

        setTimeout(() => {
            scriptsGrid.innerHTML = '';
            scriptsGrid.style.opacity = '1';

            if (scriptsToShow.length === 0) {
                noResults.style.display = 'block';
                prevPage.disabled = true;
                nextPage.disabled = true;
                pageInfo.textContent = 'Page 0 of 0';
                return;
            }

            noResults.style.display = 'none';
            const start = (currentPage - 1) * scriptsPerPage;
            const end = start + scriptsPerPage;
            const paginatedScripts = scriptsToShow.slice(start, end);

            const fragment = document.createDocumentFragment();
            paginatedScripts.forEach(script => {
                fragment.appendChild(createScriptCard(script));
            });
            scriptsGrid.appendChild(fragment);

            const totalPages = Math.ceil(scriptsToShow.length / scriptsPerPage);
            prevPage.disabled = currentPage === 1;
            nextPage.disabled = currentPage === totalPages;
            pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
        }, 500);
    };

    // Function to filter and sort scripts
    const filterScripts = () => {
        const searchInput = document.getElementById('searchInput');
        const gameFilter = document.getElementById('gameFilter');
        const categoryFilter = document.getElementById('categoryFilter');
        const sortFilter = document.getElementById('sortFilter');
        const showFavorites = document.getElementById('showFavorites');

        if (!searchInput || !gameFilter || !categoryFilter || !sortFilter || !showFavorites) {
            console.error('Filter elements not found.');
            return;
        }

        const searchTerm = searchInput.value.trim().toLowerCase();
        const selectedGame = gameFilter.value;
        const selectedCategory = categoryFilter.value;
        const sortBy = sortFilter.value;
        const showFavoritesOnly = showFavorites.checked;

        let filteredScripts = scripts.filter(script => {
            const searchFields = [
                script.name.toLowerCase(),
                script.game.toLowerCase(),
                script.category.toLowerCase(),
                script.description.toLowerCase()
            ];
            const matchesSearch = searchTerm === '' || searchFields.some(field => field.includes(searchTerm));
            const matchesGame = selectedGame === '' || script.game === selectedGame;
            const matchesCategory = selectedCategory === '' || script.category === selectedCategory;
            const matchesFavorites = !showFavoritesOnly || isFavorite(script.name);
            return matchesSearch && matchesGame && matchesCategory && matchesFavorites;
        });

        if (sortBy === 'popularity') {
            filteredScripts.sort((a, b) => b.popularity - a.popularity);
        } else if (sortBy === 'newest') {
            filteredScripts.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
        } else {
            filteredScripts.sort((a, b) => a.name.localeCompare(b.name));
        }

        currentPage = 1;
        displayScripts(filteredScripts);
    };

    // Initialize event listeners
    const initEventListeners = () => {
        const searchInput = document.getElementById('searchInput');
        const gameFilter = document.getElementById('gameFilter');
        const categoryFilter = document.getElementById('categoryFilter');
        const sortFilter = document.getElementById('sortFilter');
        const showFavorites = document.getElementById('showFavorites');
        const prevPage = document.getElementById('prevPage');
        const nextPage = document.getElementById('nextPage');
        const scriptsGrid = document.getElementById('scriptsGrid');

        if (!searchInput || !gameFilter || !categoryFilter || !sortFilter || !showFavorites || !prevPage || !nextPage || !scriptsGrid) {
            console.error('Search input field or DOM elements for event listeners not found.');
            return;
        }

        const debouncedFilter = debounce(filterScripts, 300);
        searchInput.addEventListener('input', debouncedFilter);
        gameFilter.addEventListener('change', filterScripts);
        categoryFilter.addEventListener('change', filterScripts);
        sortFilter.addEventListener('change', filterScripts);
        showFavorites.addEventListener('change', filterScripts);

        searchInput.addEventListener('touchstart', () => {
            searchInput.focus();
        });
        [gameFilter, categoryFilter, sortFilter].forEach(select => {
            select.addEventListener('touchstart', () => {
                select.focus();
            });
        });
        showFavorites.addEventListener('touchstart', () => {
            showFavorites.focus();
        });

        prevPage.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                filterScripts();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });

        nextPage.addEventListener('click', () => {
            if (currentPage < Math.ceil(scripts.length / scriptsPerPage)) {
                currentPage++;
                filterScripts();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });

        // Simplified event delegation for favorite buttons
        scriptsGrid.addEventListener('click', (e) => {
            const favoriteBtn = e.target.closest('.favorite-btn');
            if (favoriteBtn) {
                const scriptName = favoriteBtn.dataset.scriptName;
                if (scriptName) {
                    toggleFavorite(scriptName);
                    e.stopPropagation();
                    e.preventDefault(); // Prevent multiple triggers
                } else {
                    console.warn('No data-script-name found on favorite button.');
                }
            }
        });
    };

    // Initialize the app
    const init = () => {
        try {
            initEventListeners();
            filterScripts();
        } catch (error) {
            console.error('Initialization failed:', error);
        }
    };

    init();
});
