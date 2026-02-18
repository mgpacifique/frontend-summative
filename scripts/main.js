/**
 * main.js
 * Main application entry point
 * Coordinates all modules and handles events
 */

import { initState, getBooks, addBook, updateBook, deleteBook, setBooks, getBookById } from './state.js';
import { validateBook, getTodayDate } from './validators.js';
import { compileRegex, filterBooks, sortBooks } from './search.js';
import {
    renderBooksTable,
    renderBooksCards,
    updateDashboard,
    showStatus,
    showFieldError,
    clearFormErrors,
    navigateToSection,
    resetBookForm,
    populateFormForEdit
} from './ui.js';
import { exportToJSON, importFromJSON, clearAllData } from './storage.js';

// Application state
let currentSearchRegex = null;
let currentSortOption = 'date-desc';

/**
 * Initialize the application
 */
function init() {
    // Load data from localStorage
    initState();

    // Load settings and set target input
    import('./state.js').then(({ getSettings }) => {
        const settings = getSettings();
        const targetInput = document.getElementById('pages-target');
        if (targetInput && settings.targetPages) {
            targetInput.value = settings.targetPages;
        }
    });

    // Set up event listeners
    setupEventListeners();

    // Check for first visit
    checkFirstVisit();

    // Initial render
    refreshUI();

    // Set today's date as default
    document.getElementById('book-date').value = getTodayDate();
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', handleNavigation);
    });

    // Book form submission
    const bookForm = document.getElementById('book-form');
    bookForm.addEventListener('submit', handleFormSubmit);

    // Cancel button
    document.getElementById('cancel-btn').addEventListener('click', () => {
        resetBookForm();
        navigateToSection('books');
    });

    // Search input
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', handleSearch);

    // Case sensitive toggle
    const caseSensitiveToggle = document.getElementById('case-sensitive-toggle');
    caseSensitiveToggle.addEventListener('change', handleSearch);

    // Sort dropdown
    const sortSelect = document.getElementById('sort-select');
    sortSelect.addEventListener('change', handleSort);

    // Settings buttons
    document.getElementById('export-btn').addEventListener('click', handleExport);
    document.getElementById('import-btn').addEventListener('click', handleImport);
    document.getElementById('clear-data-btn').addEventListener('click', handleClearData);

    // Target pages
    document.getElementById('set-target-btn').addEventListener('click', handleSetTarget);

    // Onboarding buttons
    document.getElementById('load-sample-btn').addEventListener('click', handleLoadSample);
    document.getElementById('start-fresh-btn').addEventListener('click', handleStartFresh);

    // TODO: Add event delegation for edit and delete buttons
    document.addEventListener('click', handleActionButtons);
}

/**
 * Handle navigation clicks
 * @param {Event} e - Click event
 */
function handleNavigation(e) {
    e.preventDefault();
    const sectionId = e.target.dataset.section;
    if (sectionId) {
        navigateToSection(sectionId);
    }
}

/**
 * Handle form submission (add or edit)
 * @param {Event} e - Submit event
 */
function handleFormSubmit(e) {
    e.preventDefault();
    clearFormErrors();

    // Gather form data
    const bookData = {
        title: document.getElementById('book-title').value,
        author: document.getElementById('book-author').value,
        pages: document.getElementById('book-pages').value,
        tag: document.getElementById('book-tag').value,
        date: document.getElementById('book-date').value,
        notes: document.getElementById('book-notes').value
    };

    // Validate
    const validation = validateBook(bookData);
    if (!validation.valid) {
        // Show errors
        for (const [field, message] of Object.entries(validation.errors)) {
            showFieldError(`book-${field}`, message);
        }
        showStatus('form-status', 'Please fix the errors above', 'error');
        return;
    }

    // Check if editing or adding
    const bookId = document.getElementById('book-id').value;

    if (bookId) {
        // Update existing book
        updateBook(bookId, bookData);
        showStatus('form-status', 'Book updated successfully!', 'success');
    } else {
        // Add new book
        addBook(bookData);
        showStatus('form-status', 'Book added successfully!', 'success');
    }

    // Reset form and refresh UI
    setTimeout(() => {
        resetBookForm();
        navigateToSection('books');
        refreshUI();
    }, 1000);
}

/**
 * Handle search input
 */
function handleSearch() {
    const searchInput = document.getElementById('search-input').value;
    const caseSensitive = document.getElementById('case-sensitive-toggle').checked;

    // Compile regex
    const flags = caseSensitive ? 'g' : 'gi';
    currentSearchRegex = compileRegex(searchInput, flags);

    if (searchInput && !currentSearchRegex) {
        showStatus('search-status', 'Invalid regex pattern', 'error');
        return;
    }

    // Update status
    if (searchInput) {
        showStatus('search-status', `Searching with pattern: ${searchInput}`, 'info');
    } else {
        showStatus('search-status', '', 'info');
    }

    // Refresh display
    refreshBooksDisplay();
}

/**
 * Handle sort change
 * @param {Event} e - Change event
 */
function handleSort(e) {
    currentSortOption = e.target.value;
    refreshBooksDisplay();
}

/**
 * Handle action buttons (edit/delete) via event delegation
 * @param {Event} e - Click event
 */
function handleActionButtons(e) {
    const target = e.target;

    // Edit button
    if (target.classList.contains('edit')) {
        const bookId = target.dataset.id;
        const book = getBookById(bookId);
        if (book) {
            populateFormForEdit(book);
        }
    }

    // Delete button
    if (target.classList.contains('delete')) {
        const bookId = target.dataset.id;
        const book = getBookById(bookId);

        if (book && confirm(`Are you sure you want to delete "${book.title}"?`)) {
            deleteBook(bookId);
            showStatus('search-status', 'Book deleted successfully', 'success');
            refreshUI();
        }
    }
}

/**
 * Handle export to JSON
 */
function handleExport() {
    const books = getBooks();
    const jsonString = exportToJSON(books);

    if (!jsonString) {
        showStatus('settings-status', 'Error exporting data', 'error');
        return;
    }

    // Create download link
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `books-vault-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showStatus('settings-status', 'Data exported successfully!', 'success');
}

/**
 * Handle import from JSON
 */
function handleImport() {
    const fileInput = document.getElementById('import-file');
    const file = fileInput.files[0];

    if (!file) {
        showStatus('settings-status', 'Please select a file', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const jsonString = e.target.result;
        const result = importFromJSON(jsonString);

        if (!result.valid) {
            showStatus('settings-status', `Import failed: ${result.errors.join(', ')}`, 'error');
            return;
        }

        // TODO: Add more thorough validation
        setBooks(result.data);
        localStorage.setItem('visited', 'true');
        refreshUI();
        showStatus('settings-status', 'Data imported successfully!', 'success');
        fileInput.value = '';
    };

    reader.readAsText(file);
}

/**
 * Handle clear all data
 */
function handleClearData() {
    if (!confirm('Are you sure you want to delete ALL books? This cannot be undone!')) {
        return;
    }

    clearAllData();
    setBooks([]);
    refreshUI();
    showStatus('settings-status', 'All data cleared', 'success');
}

/**
 * Handle set target
 */
function handleSetTarget() {
    const target = parseInt(document.getElementById('pages-target').value);

    if (isNaN(target) || target <= 0) {
        showStatus('settings-status', 'Please enter a valid target (positive number)', 'error');
        return;
    }

    // Save target to settings
    import('./state.js').then(({ updateSettings, getSettings }) => {
        updateSettings({ targetPages: target });
        showStatus('settings-status', `Reading goal set to ${target.toLocaleString()} pages!`, 'success');

        // Refresh dashboard to update progress bar
        refreshUI();
    });
}

/**
 * Check if this is the user's first visit
 */
function checkFirstVisit() {
    // If we have books, assume not first visit (or user already imported)
    // But requirement says "if library is empty" essentially, or specific flag.
    // User asked: "asking user to choose... whether they will complete it with there own entries"
    // Let's use a specific flag 'visited'.
    const visited = localStorage.getItem('visited');
    const hasBooks = getBooks().length > 0;

    if (!visited && !hasBooks) {
        document.getElementById('onboarding-modal').classList.remove('hidden');
    }
}

/**
 * Handle "Load Sample Data"
 */
function handleLoadSample() {
    fetch('assets/seed/seed.json')
        .then(response => {
            if (!response.ok) throw new Error('Failed to load seed data');
            return response.json();
        })
        .then(data => {
            if (Array.isArray(data)) {
                setBooks(data);
                localStorage.setItem('visited', 'true');
                document.getElementById('onboarding-modal').classList.add('hidden');
                refreshUI();
                showStatus('search-status', 'Sample data loaded successfully! Enjoy your charts.', 'success');
            } else {
                console.error('Seed data is not an array');
            }
        })
        .catch(err => {
            console.error('Error loading sample data:', err);
            alert('Failed to load sample data. Please try importing manually.');
        });
}

/**
 * Handle "Start Fresh"
 */
function handleStartFresh() {
    localStorage.setItem('visited', 'true');
    document.getElementById('onboarding-modal').classList.add('hidden');
    showStatus('search-status', 'Welcome! Start by adding your first book.', 'info');
}

/**
 * Refresh the entire UI
 */
function refreshUI() {
    refreshBooksDisplay();
    updateDashboard(getBooks());
}

/**
 * Refresh books display (table and cards)
 */
function refreshBooksDisplay() {
    let books = getBooks();

    // Apply search filter
    if (currentSearchRegex) {
        books = filterBooks(books, currentSearchRegex);
    }

    // Apply sorting
    books = sortBooks(books, currentSortOption);

    // Render
    renderBooksTable(books, currentSearchRegex);
    renderBooksCards(books, currentSearchRegex);
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
