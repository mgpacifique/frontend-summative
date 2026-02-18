/**
 * storage.js
 * Handles localStorage persistence for books data
 */

const STORAGE_KEY = 'booksVault:data';
const SETTINGS_KEY = 'booksVault:settings';

/**
 * Load books data from localStorage
 * @returns {Array} Array of book objects
 */
export function loadBooks() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error loading books from localStorage:', error);
        return [];
    }
}

/**
 * Save books data to localStorage
 * @param {Array} books - Array of book objects to save
 * @returns {boolean} Success status
 */
export function saveBooks(books) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
        return true;
    } catch (error) {
        console.error('Error saving books to localStorage:', error);
        return false;
    }
}

/**
 * Load settings from localStorage
 * @returns {Object} Settings object
 */
export function loadSettings() {
    try {
        const settings = localStorage.getItem(SETTINGS_KEY);
        return settings ? JSON.parse(settings) : {
            pageUnit: 'pages',
            targetPages: 1000
        };
    } catch (error) {
        console.error('Error loading settings:', error);
        return { pageUnit: 'pages', targetPages: 1000 };
    }
}

/**
 * Save settings to localStorage
 * @param {Object} settings - Settings object to save
 * @returns {boolean} Success status
 */
export function saveSettings(settings) {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        return true;
    } catch (error) {
        console.error('Error saving settings:', error);
        return false;
    }
}

/**
 * Clear all data from localStorage
 * @returns {boolean} Success status
 */
export function clearAllData() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        return true;
    } catch (error) {
        console.error('Error clearing data:', error);
        return false;
    }
}

/**
 * Export books data as JSON
 * @param {Array} books - Books to export
 * @returns {string} JSON string
 */
export function exportToJSON(books) {
    try {
        return JSON.stringify(books, null, 2);
    } catch (error) {
        console.error('Error exporting to JSON:', error);
        return null;
    }
}

/**
 * Validate and import JSON data
 * @param {string} jsonString - JSON string to import
 * @returns {Object} { valid: boolean, data: Array|null, errors: Array }
 */
export function importFromJSON(jsonString) {
    const result = { valid: false, data: null, errors: [] };
    
    try {
        const data = JSON.parse(jsonString);
        
        // Validate that data is an array
        if (!Array.isArray(data)) {
            result.errors.push('Data must be an array of books');
            return result;
        }
        
        // Validate each book object
        const requiredFields = ['title', 'author', 'pages', 'tag', 'date'];
        const ids = new Set();
        
        for (let i = 0; i < data.length; i++) {
            const book = data[i];
            
            // Check required fields
            for (const field of requiredFields) {
                if (!book[field]) {
                    result.errors.push(`Book at index ${i} is missing required field: ${field}`);
                }
            }
            
            // Check for duplicate IDs
            if (book.id) {
                if (ids.has(book.id)) {
                    result.errors.push(`Duplicate ID found: ${book.id}`);
                }
                ids.add(book.id);
            }
            
            // Validate pages is a number
            if (book.pages && isNaN(parseInt(book.pages))) {
                result.errors.push(`Book at index ${i} has invalid pages value: ${book.pages}`);
            }
            
            // Validate date format (YYYY-MM-DD)
            if (book.date && !/^\d{4}-\d{2}-\d{2}$/.test(book.date)) {
                result.errors.push(`Book at index ${i} has invalid date format: ${book.date}`);
            }
        }
        
        // If there are any errors, return invalid
        if (result.errors.length > 0) {
            return result;
        }
        
        result.valid = true;
        result.data = data;
        return result;
    } catch (error) {
        result.errors.push(`Invalid JSON: ${error.message}`);
        return result;
    }
}
