/**
 * state.js
 * Manages application state
 */

import { loadBooks, saveBooks, loadSettings } from './storage.js';

// Application state
let books = [];
let settings = {};
let currentFilter = null;
let currentSort = 'date-desc';

/**
 * Initialize state from localStorage
 */
export function initState() {
    books = loadBooks();
    settings = loadSettings();
}

/**
 * Get all books
 * @returns {Array} Array of books
 */
export function getBooks() {
    return [...books];
}

/**
 * Get a single book by ID
 * @param {string} id - Book ID
 * @returns {Object|null} Book object or null
 */
export function getBookById(id) {
    return books.find(book => book.id === id) || null;
}

/**
 * Add a new book
 * @param {Object} bookData - Book data without ID and timestamps
 * @returns {Object} The created book
 */
export function addBook(bookData) {
    const now = new Date().toISOString();
    const newBook = {
        id: generateId(),
        ...bookData,
        createdAt: now,
        updatedAt: now
    };
    
    books.push(newBook);
    saveBooks(books);
    return newBook;
}

/**
 * Update an existing book
 * @param {string} id - Book ID
 * @param {Object} updates - Fields to update
 * @returns {Object|null} Updated book or null
 */
export function updateBook(id, updates) {
    const index = books.findIndex(book => book.id === id);
    if (index === -1) return null;
    
    books[index] = {
        ...books[index],
        ...updates,
        id: books[index].id, // Preserve ID
        createdAt: books[index].createdAt, // Preserve creation time
        updatedAt: new Date().toISOString()
    };
    
    saveBooks(books);
    return books[index];
}

/**
 * Delete a book
 * @param {string} id - Book ID
 * @returns {boolean} Success status
 */
export function deleteBook(id) {
    const initialLength = books.length;
    books = books.filter(book => book.id !== id);
    
    if (books.length < initialLength) {
        saveBooks(books);
        return true;
    }
    return false;
}

/**
 * Generate a unique ID for a book
 * @returns {string} Unique ID
 */
function generateId() {
    // TODO: Implement ID generation (e.g., 'book_0001', 'book_0002', etc.)
    // Consider using timestamp + random or sequential numbering
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `book_${timestamp}_${random}`;
}

/**
 * Get current settings
 * @returns {Object} Settings object
 */
export function getSettings() {
    return { ...settings };
}

/**
 * Update settings
 * @param {Object} newSettings - Settings to update
 */
export function updateSettings(newSettings) {
    settings = { ...settings, ...newSettings };
    import('./storage.js').then(({ saveSettings }) => {
        saveSettings(settings);
    });
}

/**
 * Set all books (used for import)
 * @param {Array} newBooks - Array of books
 */
export function setBooks(newBooks) {
    books = newBooks;
    saveBooks(books);
}

/**
 * Get current filter
 * @returns {RegExp|null} Current filter regex or null
 */
export function getCurrentFilter() {
    return currentFilter;
}

/**
 * Set current filter
 * @param {RegExp|null} filter - Filter regex
 */
export function setCurrentFilter(filter) {
    currentFilter = filter;
}

/**
 * Get current sort option
 * @returns {string} Current sort option
 */
export function getCurrentSort() {
    return currentSort;
}

/**
 * Set current sort option
 * @param {string} sort - Sort option
 */
export function setCurrentSort(sort) {
    currentSort = sort;
}
