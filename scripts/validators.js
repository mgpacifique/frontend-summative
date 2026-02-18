/**
 * validators.js
 * Regex validation patterns and functions
 */

/**
 * Regex patterns for validation
 */
export const patterns = {
    // Title/Description: No leading/trailing spaces, no double spaces
    // Pattern: /^\S(?:.*\S)?$/
    title: /^\S(?:.*\S)?$/,

    // Author/Tag: Letters, spaces, and hyphens only
    // Pattern: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/
    category: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,

    // Pages: Positive integer or decimal
    // Pattern: ^(0|[1-9]\d*)(\.\d{1,2})?$
    pages: /^[1-9]\d*$/,

    // Date: YYYY-MM-DD format
    // Pattern: ^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$
    date: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,

    // Advanced: Detect duplicate words (back-reference)
    // Pattern: \b(\w+)\s+\1\b
    duplicateWords: /\b(\w+)\s+\1\b/i,

    // Advanced: ISBN detection (example)
    isbn: /(?:ISBN(?:-1[03])?:?\s*)?(?=[0-9X]{10}$|(?=(?:[0-9]+[-\s]){3})[-\s0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[-\s]){4})[-\s0-9]{17}$)(?:97[89][-\s]?)?[0-9]{1,5}[-\s]?[0-9]+[-\s]?[0-9]+[-\s]?[0-9X]$/i
};

/**
 * Validate title/description
 * @param {string} value - Value to validate
 * @returns {Object} { valid: boolean, message: string }
 */
export function validateTitle(value) {
    if (!value || value.trim().length === 0) {
        return { valid: false, message: 'Title is required' };
    }

    if (!patterns.title.test(value)) {
        return { valid: false, message: 'Title cannot have leading/trailing spaces' };
    }

    if (/\s{2,}/.test(value)) {
        return { valid: false, message: 'Title cannot have double spaces' };
    }

    if (value.length < 2) {
        return { valid: false, message: 'Title must be at least 2 characters' };
    }

    return { valid: true, message: '' };
}

/**
 * Validate author name
 * @param {string} value - Value to validate
 * @returns {Object} { valid: boolean, message: string }
 */
export function validateAuthor(value) {
    if (!value || value.trim().length === 0) {
        return { valid: false, message: 'Author is required' };
    }

    if (!patterns.category.test(value)) {
        return { valid: false, message: 'Author must contain only letters, spaces, and hyphens' };
    }

    return { valid: true, message: '' };
}

/**
 * Validate pages number
 * @param {string} value - Value to validate
 * @returns {Object} { valid: boolean, message: string }
 */
export function validatePages(value) {
    if (!value || value.trim().length === 0) {
        return { valid: false, message: 'Pages is required' };
    }

    if (!patterns.pages.test(value)) {
        return { valid: false, message: 'Pages must be a positive integer' };
    }

    const num = parseInt(value, 10);
    if (num <= 0) {
        return { valid: false, message: 'Pages must be greater than 0' };
    }

    return { valid: true, message: '' };
}

/**
 * Validate tag/category
 * @param {string} value - Value to validate
 * @returns {Object} { valid: boolean, message: string }
 */
export function validateTag(value) {
    if (!value || value.trim().length === 0) {
        return { valid: false, message: 'Tag is required' };
    }

    if (!patterns.category.test(value)) {
        return { valid: false, message: 'Tag must contain only letters, spaces, and hyphens' };
    }

    return { valid: true, message: '' };
}

/**
 * Validate date in YYYY-MM-DD format
 * @param {string} value - Value to validate
 * @returns {Object} { valid: boolean, message: string }
 */
export function validateDate(value) {
    if (!value || value.trim().length === 0) {
        return { valid: false, message: 'Date is required' };
    }

    if (!patterns.date.test(value)) {
        return { valid: false, message: 'Date must be in YYYY-MM-DD format' };
    }

    // Additional check: validate it's a real date
    const dateObj = new Date(value);
    if (isNaN(dateObj.getTime())) {
        return { valid: false, message: 'Invalid date' };
    }

    return { valid: true, message: '' };
}

/**
 * Check for duplicate words (advanced regex with back-reference)
 * @param {string} text - Text to check
 * @returns {Array} Array of duplicate words found
 */
export function findDuplicateWords(text) {
    const matches = [];
    const regex = /\b(\w+)\s+\1\b/gi;
    let match;

    while ((match = regex.exec(text)) !== null) {
        matches.push(match[1]);
    }

    return matches;
}

/**
 * Validate entire book object
 * @param {Object} book - Book object to validate
 * @returns {Object} { valid: boolean, errors: Object }
 */
export function validateBook(book) {
    const errors = {};

    const titleValidation = validateTitle(book.title);
    if (!titleValidation.valid) errors.title = titleValidation.message;

    const authorValidation = validateAuthor(book.author);
    if (!authorValidation.valid) errors.author = authorValidation.message;

    const pagesValidation = validatePages(book.pages);
    if (!pagesValidation.valid) errors.pages = pagesValidation.message;

    const tagValidation = validateTag(book.tag);
    if (!tagValidation.valid) errors.tag = tagValidation.message;

    const dateValidation = validateDate(book.date);
    if (!dateValidation.valid) errors.date = dateValidation.message;

    return {
        valid: Object.keys(errors).length === 0,
        errors
    };
}

/**
 * Get today's date in YYYY-MM-DD format
 * @returns {string} Today's date
 */
export function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
