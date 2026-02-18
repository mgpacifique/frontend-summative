/**
 * ui.js
 * DOM manipulation and UI updates
 */

import { getBooks, deleteBook } from './state.js';
import { highlightMatches, sortBooks, filterBooks } from './search.js';

/**
 * Render the books table
 * @param {Array} books - Books to render
 * @param {RegExp} searchRegex - Optional search regex for highlighting
 */
export function renderBooksTable(books, searchRegex = null) {
    const tbody = document.getElementById('books-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (books.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No books found</td></tr>';
        return;
    }

    books.forEach(book => {
        const row = createBookRow(book, searchRegex);
        tbody.appendChild(row);
    });
}

/**
 * Create a table row for a book
 * @param {Object} book - Book object
 * @param {RegExp} searchRegex - Optional search regex for highlighting
 * @returns {HTMLElement} Table row element
 */
function createBookRow(book, searchRegex = null) {
    const row = document.createElement('tr');
    row.dataset.bookId = book.id;

    // Apply highlighting if search regex is provided
    const title = searchRegex ? highlightMatches(book.title, searchRegex) : book.title;
    const author = searchRegex ? highlightMatches(book.author, searchRegex) : book.author;
    const tag = searchRegex ? highlightMatches(book.tag, searchRegex) : book.tag;

    row.innerHTML = `
        <td>${title}</td>
        <td>${author}</td>
        <td>${book.pages}</td>
        <td>${tag}</td>
        <td>${book.date}</td>
        <td>
            <button class="action-btn edit" data-id="${book.id}" aria-label="Edit ${book.title}">Edit</button>
            <button class="action-btn delete" data-id="${book.id}" aria-label="Delete ${book.title}">Delete</button>
        </td>
    `;

    // TODO: Add event listeners for edit and delete buttons

    return row;
}

/**
 * Render books as cards (mobile view)
 * @param {Array} books - Books to render
 * @param {RegExp} searchRegex - Optional search regex for highlighting
 */
export function renderBooksCards(books, searchRegex = null) {
    const container = document.getElementById('books-cards');
    if (!container) return;

    container.innerHTML = '';

    if (books.length === 0) {
        container.innerHTML = '<p style="text-align: center;">No books found</p>';
        return;
    }

    books.forEach(book => {
        const card = createBookCard(book, searchRegex);
        container.appendChild(card);
    });
}

/**
 * Create a card element for a book
 * @param {Object} book - Book object
 * @param {RegExp} searchRegex - Optional search regex for highlighting
 * @returns {HTMLElement} Card element
 */
function createBookCard(book, searchRegex = null) {
    const card = document.createElement('div');
    card.className = 'book-card';
    card.dataset.bookId = book.id;

    const title = searchRegex ? highlightMatches(book.title, searchRegex) : book.title;
    const author = searchRegex ? highlightMatches(book.author, searchRegex) : book.author;
    const tag = searchRegex ? highlightMatches(book.tag, searchRegex) : book.tag;

    card.innerHTML = `
        <h3>${title}</h3>
        <div class="book-card-field">
            <strong>Author:</strong>
            <span>${author}</span>
        </div>
        <div class="book-card-field">
            <strong>Pages:</strong>
            <span>${book.pages}</span>
        </div>
        <div class="book-card-field">
            <strong>Tag:</strong>
            <span>${tag}</span>
        </div>
        <div class="book-card-field">
            <strong>Date Added:</strong>
            <span>${book.date}</span>
        </div>
        <div class="book-card-field">
            <button class="action-btn edit" data-id="${book.id}">Edit</button>
            <button class="action-btn delete" data-id="${book.id}">Delete</button>
        </div>
    `;

    // TODO: Add event listeners for edit and delete buttons

    return card;
}

/**
 * Update dashboard statistics
 * @param {Array} books - Books data
 */
export function updateDashboard(books) {
    // Total books
    const totalBooks = books.length;
    document.getElementById('total-books').textContent = totalBooks;

    // Total pages
    const totalPages = books.reduce((sum, book) => sum + parseInt(book.pages || 0), 0);
    document.getElementById('total-pages').textContent = totalPages.toLocaleString();

    // Top tag
    const topTag = getTopTag(books);
    document.getElementById('top-tag').textContent = topTag || '-';

    // Average Book Length
    const avgLength = calculateAverageBookLength(books);
    document.getElementById('avg-length').textContent = avgLength;

    // Top Author
    const topAuthor = getTopAuthor(books);
    document.getElementById('top-author').textContent = topAuthor || '-';

    // Update progress bar
    updateProgressBar(totalPages);

    // Render Charts
    renderTopDaysChart(books);
    renderTopTagsChart(books);
}

/**
 * Render the Top Days bar chart (Sun-Sat)
 * @param {Array} books - Books data
 */
function renderTopDaysChart(books) {
    const chartContainer = document.getElementById('top-days-chart');
    if (!chartContainer) return;

    // Initialize days (Sun=0 to Sat=6)
    const days = [
        { label: 'Sun', count: 0 },
        { label: 'Mon', count: 0 },
        { label: 'Tue', count: 0 },
        { label: 'Wed', count: 0 },
        { label: 'Thu', count: 0 },
        { label: 'Fri', count: 0 },
        { label: 'Sat', count: 0 }
    ];

    // Aggregation
    books.forEach(book => {
        if (!book.date) return;
        const date = new Date(book.date);
        const dayIndex = date.getDay(); // 0-6
        if (days[dayIndex]) {
            days[dayIndex].count++;
        }
    });

    const maxCount = Math.max(...days.map(d => d.count), 1);

    chartContainer.innerHTML = days.map(day => {
        // Calculate height percentage (min 1% for visibility)
        const heightPct = (day.count / maxCount) * 100;
        return `
        <div class="chart-bar" style="height: ${heightPct}%" title="${day.label}: ${day.count} book(s)">
            <span class="bar-label">${day.count > 0 ? day.count : ''}</span>
            <div class="bar-day">${day.label}</div>
        </div>
        `;
    }).join('');
}

/**
 * Render the Top Tags pie chart
 * @param {Array} books - Books data
 */
function renderTopTagsChart(books) {
    const chart = document.getElementById('top-tags-chart');
    const legend = document.getElementById('top-tags-legend');
    if (!chart || !legend) return;

    if (books.length === 0) {
        chart.style.background = 'var(--bg-tertiary)';
        legend.innerHTML = '<span class="text-muted">No data</span>';
        return;
    }

    // Aggregate tags
    const tagCounts = {};
    books.forEach(book => {
        const tag = book.tag || 'Uncategorized';
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });

    // Sort and take top 5 + Other
    const sortedTags = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1]);

    let displayTags = sortedTags;
    if (sortedTags.length > 5) {
        const top5 = sortedTags.slice(0, 5);
        const otherCount = sortedTags.slice(5).reduce((sum, [, count]) => sum + count, 0);
        displayTags = [...top5, ['Other', otherCount]];
    }

    const total = books.length;
    let currentDeg = 0;
    const gradientParts = [];
    const colors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

    legend.innerHTML = '';

    displayTags.forEach(([tag, count], index) => {
        const pct = count / total;
        const deg = pct * 360;
        const color = colors[index % colors.length];

        gradientParts.push(`${color} ${currentDeg}deg ${currentDeg + deg}deg`);
        currentDeg += deg;

        // Add to legend
        legend.innerHTML += `
            <div class="legend-item">
                <div class="legend-color" style="background-color: ${color}"></div>
                <span>${tag} (${Math.round(pct * 100)}%)</span>
            </div>
        `;
    });

    chart.style.background = `conic-gradient(${gradientParts.join(', ')})`;
}

/**
 * Get the most common tag
 * @param {Array} books - Books data
 * @returns {string} Most common tag
 */
function getTopTag(books) {
    if (books.length === 0) return '';

    const tagCounts = {};
    books.forEach(book => {
        tagCounts[book.tag] = (tagCounts[book.tag] || 0) + 1;
    });

    let topTag = '';
    let maxCount = 0;
    for (const [tag, count] of Object.entries(tagCounts)) {
        if (count > maxCount) {
            maxCount = count;
            topTag = tag;
        }
    }

    return topTag;
}

/**
 * Calculate the average book length
 * @param {Array} books - Books data
 * @returns {number} Average pages
 */
function calculateAverageBookLength(books) {
    if (books.length === 0) return 0;
    const totalPages = books.reduce((sum, book) => sum + parseInt(book.pages || 0), 0);
    return Math.round(totalPages / books.length);
}

/**
 * Get the author with the most books
 * @param {Array} books - Books data
 * @returns {string} Top author name
 */
function getTopAuthor(books) {
    if (books.length === 0) return '';

    const authorCounts = {};
    books.forEach(book => {
        authorCounts[book.author] = (authorCounts[book.author] || 0) + 1;
    });

    let topAuthor = '';
    let maxCount = 0;
    for (const [author, count] of Object.entries(authorCounts)) {
        if (count > maxCount) {
            maxCount = count;
            topAuthor = author;
        }
    }

    return topAuthor;
}

/**
 * Show a status message
 * @param {string} elementId - ID of the status element
 * @param {string} message - Message to display
 * @param {string} type - Type of message ('success', 'error', 'info')
 */
export function showStatus(elementId, message, type = 'info') {
    const element = document.getElementById(elementId);
    if (!element) return;

    element.textContent = message;
    element.className = `status-${type}`;

    // Auto-clear after 5 seconds
    setTimeout(() => {
        element.textContent = '';
        element.className = '';
    }, 5000);
}

/**
 * Show validation error for a form field
 * @param {string} fieldId - Field ID
 * @param {string} message - Error message
 */
export function showFieldError(fieldId, message) {
    const errorElement = document.getElementById(`${fieldId}-error`);
    if (errorElement) {
        errorElement.textContent = message;
    }
}

/**
 * Clear all form errors
 */
export function clearFormErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(el => el.textContent = '');
}

/**
 * Navigate to a section
 * @param {string} sectionId - Section ID
 */
export function navigateToSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Update navigation active state
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.section === sectionId) {
            link.classList.add('active');
        }
    });
}

/**
 * Reset the book form
 */
export function resetBookForm() {
    const form = document.getElementById('book-form');
    if (form) {
        form.reset();
        document.getElementById('book-id').value = '';
        document.getElementById('form-heading').textContent = 'Add New Book';
        document.getElementById('submit-btn').textContent = 'Add Book';
    }
    clearFormErrors();
}

/**
 * Populate form with book data for editing
 * @param {Object} book - Book object
 */
export function populateFormForEdit(book) {
    document.getElementById('book-id').value = book.id;
    document.getElementById('book-title').value = book.title;
    document.getElementById('book-author').value = book.author;
    document.getElementById('book-pages').value = book.pages;
    document.getElementById('book-tag').value = book.tag;
    document.getElementById('book-date').value = book.date;
    document.getElementById('book-notes').value = book.notes || '';

    document.getElementById('form-heading').textContent = 'Edit Book';
    document.getElementById('submit-btn').textContent = 'Update Book';

    navigateToSection('add-book');
}

/**
 * Update the progress bar based on current pages vs target
 * @param {number} totalPages - Total pages read
 */
function updateProgressBar(totalPages) {
    const targetInput = document.getElementById('pages-target');
    const target = parseInt(targetInput.value) || 1000;
    const progressFill = document.getElementById('progress-fill');
    const statusElement = document.getElementById('target-status');

    if (!progressFill || !statusElement) return;

    // Calculate percentage (cap at 100% for display)
    const percentage = Math.min((totalPages / target) * 100, 100);
    const actualPercentage = (totalPages / target) * 100;

    // Update progress bar
    progressFill.style.width = `${percentage}%`;
    progressFill.textContent = `${percentage.toFixed(1)}%`;

    // Update status message
    const remaining = target - totalPages;

    if (remaining > 0) {
        statusElement.textContent = `${remaining.toLocaleString()} pages remaining to reach your goal of ${target.toLocaleString()} pages`;
        statusElement.setAttribute('aria-live', 'polite');
    } else if (remaining === 0) {
        statusElement.textContent = `🎉 Perfect! You've reached your goal of ${target.toLocaleString()} pages!`;
        statusElement.setAttribute('aria-live', 'assertive');
    } else {
        statusElement.textContent = `🎉 Incredible! You've exceeded your goal by ${Math.abs(remaining).toLocaleString()} pages!`;
        statusElement.setAttribute('aria-live', 'assertive');
    }
}


