/**
 * search.js
 * Search and highlight functionality with regex
 */

/**
 * Compile a regex pattern safely
 * @param {string} pattern - Regex pattern string
 * @param {string} flags - Regex flags (default: 'i')
 * @returns {RegExp|null} Compiled regex or null if invalid
 */
export function compileRegex(pattern, flags = 'i') {
    try {
        return pattern ? new RegExp(pattern, flags) : null;
    } catch (error) {
        console.error('Invalid regex pattern:', error);
        return null;
    }
}

/**
 * Test if a book matches the search pattern
 * @param {Object} book - Book object
 * @param {RegExp} regex - Compiled regex pattern
 * @returns {boolean} True if book matches
 */
export function matchesSearch(book, regex) {
    if (!regex) return true;

    // TODO: Search across multiple fields
    // Test against: title, author, tag, notes, etc.
    const searchableText = [
        book.title,
        book.author,
        book.tag,
        book.notes || '',
        book.date
    ].join(' ');

    return regex.test(searchableText);
}

/**
 * Highlight matches in text using <mark> tags
 * @param {string} text - Text to highlight
 * @param {RegExp} regex - Regex pattern to match
 * @returns {string} HTML string with <mark> tags
 */
export function highlightMatches(text, regex) {
    if (!regex || !text) return text;

    try {
        // Escape HTML to prevent XSS
        const escaped = escapeHtml(text);

        // Replace matches with <mark> tags
        return escaped.replace(regex, match => `<mark>${match}</mark>`);
    } catch (error) {
        console.error('Error highlighting matches:', error);
        return text;
    }
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Filter books by regex pattern
 * @param {Array} books - Array of books
 * @param {RegExp} regex - Regex pattern
 * @returns {Array} Filtered books
 */
export function filterBooks(books, regex) {
    if (!regex) return books;

    return books.filter(book => matchesSearch(book, regex));
}

/**
 * Sort books by specified criteria
 * @param {Array} books - Array of books
 * @param {string} sortBy - Sort criterion
 * @returns {Array} Sorted books
 */
export function sortBooks(books, sortBy) {
    const sorted = [...books];

    switch (sortBy) {
        case 'date-desc':
            return sorted.sort((a, b) => new Date(b.date) - new Date(a.date));

        case 'date-asc':
            return sorted.sort((a, b) => new Date(a.date) - new Date(b.date));

        case 'title-asc':
            return sorted.sort((a, b) => a.title.localeCompare(b.title));

        case 'title-desc':
            return sorted.sort((a, b) => b.title.localeCompare(a.title));

        case 'pages-desc':
            return sorted.sort((a, b) => parseInt(b.pages) - parseInt(a.pages));

        case 'pages-asc':
            return sorted.sort((a, b) => parseInt(a.pages) - parseInt(b.pages));

        default:
            return sorted;
    }
}

/**
 * Get search suggestions based on existing data
 * @param {Array} books - Array of books
 * @returns {Object} Suggestions object
 */
export function getSearchSuggestions(books) {
    const suggestions = {
        authors: new Set(),
        tags: new Set(),
        years: new Set()
    };

    books.forEach(book => {
        suggestions.authors.add(book.author);
        suggestions.tags.add(book.tag);

        const year = book.date.split('-')[0];
        suggestions.years.add(year);
    });

    return {
        authors: Array.from(suggestions.authors).sort(),
        tags: Array.from(suggestions.tags).sort(),
        years: Array.from(suggestions.years).sort()
    };
}
