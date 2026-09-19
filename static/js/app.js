// Wisdom Vault - Vanilla JavaScript Client

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const quoteCard = document.getElementById('quoteCard');
  const quoteText = document.getElementById('quoteText');
  const quoteAuthor = document.getElementById('quoteAuthor');
  const quoteCategory = document.getElementById('quoteCategory');
  const quoteId = document.getElementById('quoteId');
  const btnNewRandom = document.getElementById('btnNewRandom');
  const btnCopyQuote = document.getElementById('btnCopyQuote');
  const btnExportCsv = document.getElementById('btnExportCsv');
  
  const searchInput = document.getElementById('searchInput');
  const btnClearSearch = document.getElementById('btnClearSearch');
  const categorySelect = document.getElementById('categorySelect');
  const authorSelect = document.getElementById('authorSelect');
  const categoryPills = document.getElementById('categoryPills');

  const resultsSection = document.getElementById('resultsSection');
  const quotesGrid = document.getElementById('quotesGrid');
  const resultsCount = document.getElementById('resultsCount');
  const toast = document.getElementById('toast');

  let currentQuote = null;
  let activeCategory = '';
  let searchDebounceTimer = null;

  // Initialize App
  init();

  async function init() {
    await Promise.all([
      loadCategories(),
      loadAuthors(),
      fetchRandomQuote()
    ]);
    setupEventListeners();
  }

  // Event Listeners Setup
  function setupEventListeners() {
    btnNewRandom.addEventListener('click', () => {
      fetchRandomQuote(activeCategory, authorSelect.value);
    });

    btnCopyQuote.addEventListener('click', () => {
      if (!currentQuote) return;
      copyQuoteToClipboard(currentQuote.quote, currentQuote.author);
    });

    if (btnExportCsv) {
      btnExportCsv.addEventListener('click', () => {
        exportQuotesToCsv();
      });
    }

    searchInput.addEventListener('input', () => {
      const val = searchInput.value.trim();
      btnClearSearch.style.display = val ? 'block' : 'none';
      
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => {
        performSearch();
      }, 250);
    });

    btnClearSearch.addEventListener('click', () => {
      searchInput.value = '';
      btnClearSearch.style.display = 'none';
      performSearch();
    });

    categorySelect.addEventListener('change', () => {
      setActiveCategory(categorySelect.value);
      performSearch();
    });

    authorSelect.addEventListener('change', () => {
      performSearch();
    });
  }

  // Helper to copy text to clipboard
  function copyQuoteToClipboard(quote, author) {
    const textToCopy = `"${quote}" — ${author}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      showToast('Quote copied to clipboard! 📋');
    }).catch(() => {
      showToast('Failed to copy quote', true);
    });
  }

  // Export quotes to CSV based on current filters
  function exportQuotesToCsv() {
    const q = searchInput.value.trim();
    const category = categorySelect.value;
    const author = authorSelect.value;

    const params = new URLSearchParams();
    if (q) params.append('q', q);
    if (category) params.append('category', category);
    if (author) params.append('author', author);

    let exportUrl = '/api/quotes/export/csv';
    if ([...params].length > 0) {
      exportUrl += `?${params.toString()}`;
    }

    showToast('Exporting quotes to CSV... 📥');
    window.location.href = exportUrl;
  }

  // Fetch and display a random quote
  async function fetchRandomQuote(category = '', author = '') {
    try {
      btnNewRandom.disabled = true;
      let url = '/api/quotes/random';
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (author) params.append('author', author);
      if ([...params].length > 0) url += `?${params.toString()}`;

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error('Could not fetch quote');
      }
      const data = await res.json();
      displayQuote(data);
    } catch (err) {
      console.error(err);
      showToast('Could not fetch a quote for this filter.', true);
    } finally {
      btnNewRandom.disabled = false;
    }
  }

  // Smoothly update the featured quote card
  function displayQuote(quote) {
    currentQuote = quote;
    
    // Fade out
    quoteCard.style.opacity = '0.4';
    quoteCard.style.transform = 'translateY(4px)';

    setTimeout(() => {
      quoteText.textContent = quote.quote;
      quoteAuthor.textContent = quote.author;
      quoteCategory.textContent = quote.category;
      quoteId.textContent = `#${quote.id}`;

      // Fade in
      quoteCard.style.opacity = '1';
      quoteCard.style.transform = 'translateY(0)';
    }, 150);
  }

  // Fetch list of categories
  async function loadCategories() {
    try {
      const res = await fetch('/api/categories');
      const categories = await res.json();

      // Populate Select
      categorySelect.innerHTML = '<option value="">All Categories</option>';
      categoryPills.innerHTML = '<button class="pill-btn active" data-cat="">All</button>';

      categories.forEach(cat => {
        // Option
        const opt = document.createElement('option');
        opt.value = cat.name;
        opt.textContent = `${cat.name} (${cat.count})`;
        categorySelect.appendChild(opt);

        // Pill
        const pill = document.createElement('button');
        pill.className = 'pill-btn';
        pill.dataset.cat = cat.name;
        pill.textContent = `${cat.name}`;
        pill.addEventListener('click', () => {
          categorySelect.value = cat.name;
          setActiveCategory(cat.name);
          performSearch();
        });
        categoryPills.appendChild(pill);
      });

      // Add listener to "All" pill
      categoryPills.querySelector('[data-cat=""]').addEventListener('click', () => {
        categorySelect.value = '';
        setActiveCategory('');
        performSearch();
      });

    } catch (err) {
      console.error('Error loading categories:', err);
    }
  }

  // Set active category and update pill UI
  function setActiveCategory(cat) {
    activeCategory = cat;
    categorySelect.value = cat;

    const pills = categoryPills.querySelectorAll('.pill-btn');
    pills.forEach(p => {
      if (p.dataset.cat.toLowerCase() === cat.toLowerCase()) {
        p.classList.add('active');
      } else {
        p.classList.remove('active');
      }
    });
  }

  // Fetch list of authors
  async function loadAuthors() {
    try {
      const res = await fetch('/api/authors');
      const authors = await res.json();

      authorSelect.innerHTML = '<option value="">All Authors</option>';
      authors.forEach(auth => {
        const opt = document.createElement('option');
        opt.value = auth.name;
        opt.textContent = `${auth.name} (${auth.count})`;
        authorSelect.appendChild(opt);
      });
    } catch (err) {
      console.error('Error loading authors:', err);
    }
  }

  // Perform search / filter query
  async function performSearch() {
    const q = searchInput.value.trim();
    const category = categorySelect.value;
    const author = authorSelect.value;

    // If all filters are blank, hide search results grid
    if (!q && !category && !author) {
      resultsSection.style.display = 'none';
      return;
    }

    try {
      const params = new URLSearchParams();
      if (q) params.append('q', q);
      if (category) params.append('category', category);
      if (author) params.append('author', author);

      const res = await fetch(`/api/quotes/search?${params.toString()}`);
      const data = await res.json();

      renderSearchResults(data.results, data.count);
    } catch (err) {
      console.error('Search error:', err);
    }
  }

  // Render quotes grid
  function renderSearchResults(quotes, count) {
    resultsSection.style.display = 'flex';
    resultsCount.textContent = `${count} quote${count === 1 ? '' : 's'} found`;
    quotesGrid.innerHTML = '';

    if (quotes.length === 0) {
      quotesGrid.innerHTML = `
        <div class="no-results">
          <p>No quotes found matching your search criteria.</p>
        </div>
      `;
      return;
    }

    quotes.forEach(quote => {
      const card = document.createElement('div');
      card.className = 'grid-card';
      card.innerHTML = `
        <div class="grid-card-body">
          <div class="grid-card-text">“${escapeHtml(quote.quote)}”</div>
        </div>
        <div class="grid-card-footer">
          <div class="grid-card-meta">
            <span class="grid-card-author">— ${escapeHtml(quote.author)}</span>
            <span class="grid-card-cat">${escapeHtml(quote.category)}</span>
          </div>
          <button class="grid-card-copy-btn" title="Copy quote to clipboard" aria-label="Copy quote">
            <span class="copy-icon">📋</span>
            <span class="copy-text">Copy</span>
          </button>
        </div>
      `;

      // Copy button event listener
      const copyBtn = card.querySelector('.grid-card-copy-btn');
      copyBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Don't trigger card selection
        copyQuoteToClipboard(quote.quote, quote.author);
        copyBtn.classList.add('copied');
        const textSpan = copyBtn.querySelector('.copy-text');
        if (textSpan) textSpan.textContent = 'Copied!';
        setTimeout(() => {
          copyBtn.classList.remove('copied');
          if (textSpan) textSpan.textContent = 'Copy';
        }, 1800);
      });

      // Card click triggers main view
      card.addEventListener('click', () => {
        displayQuote(quote);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });

      quotesGrid.appendChild(card);
    });
  }

  // Toast Notification
  function showToast(message, isError = false) {
    toast.textContent = message;
    toast.style.borderColor = isError ? '#ef4444' : 'var(--accent-primary)';
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  // HTML escape helper
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
});
