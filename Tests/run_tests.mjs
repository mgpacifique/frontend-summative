
// Mock DOM environment for search.js
global.document = {
    createElement: (tag) => {
        return {
            textContent: '',
            innerHTML: '',
            set textContent(val) {
                this._textContent = val;
                // Simple mock for escapeHtml: just returning text as is for now, 
                // or we can implement a basic escaper if needed for tests.
                // search.js uses div.innerHTML to get escaped text.
                this.innerHTML = val.replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#039;");
            },
            get textContent() { return this._textContent; }
        };
    }
};

import {
    validateTitle,
    validateAuthor,
    validatePages,
    validateTag,
    validateDate,
    findDuplicateWords,
    patterns
} from '../scripts/validators.js';

import { compileRegex, highlightMatches } from '../scripts/search.js';

// Test Framework
const results = {
    total: 0,
    passed: 0,
    failed: 0,
    failures: []
};

function test(name, fn) {
    results.total++;
    try {
        fn();
        results.passed++;
        console.log(`PASS: ${name}`);
    } catch (error) {
        results.failed++;
        results.failures.push({ name, error: error.message });
        console.error(`FAIL: ${name} - ${error.message}`);
    }
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}

function assertEqual(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(message || `Expected ${expected}, got ${actual}`);
    }
}

console.log('Running Tests...\n');

// ===========================
// Validator Tests
// ===========================

test('Validators: Title - valid with no extra spaces', () => {
    const result = validateTitle('Clean Title');
    assert(result.valid, 'Should accept clean title');
});

test('Validators: Title - reject leading space', () => {
    const result = validateTitle(' Leading Space');
    assert(!result.valid, 'Should reject leading space');
});

test('Validators: Title - reject trailing space', () => {
    const result = validateTitle('Trailing Space ');
    assert(!result.valid, 'Should reject trailing space');
});

test('Validators: Title - reject double spaces', () => {
    const result = validateTitle('Double  Space');
    assert(!result.valid, 'Should reject double spaces');
});

test('Validators: Title - reject empty', () => {
    const result = validateTitle('');
    assert(!result.valid, 'Should reject empty title');
});

test('Validators: Author - valid name', () => {
    const result = validateAuthor('John Smith');
    assert(result.valid, 'Should accept valid author name');
});

test('Validators: Author - valid with hyphen', () => {
    const result = validateAuthor('Mary-Jane Watson');
    assert(result.valid, 'Should accept hyphenated names');
});

test('Validators: Author - reject numbers', () => {
    const result = validateAuthor('John123');
    assert(!result.valid, 'Should reject numbers in author name');
});

test('Validators: Author - reject empty', () => {
    const result = validateAuthor('');
    assert(!result.valid, 'Should reject empty author');
});

test('Validators: Pages - valid positive integer', () => {
    const result = validatePages('250');
    assert(result.valid, 'Should accept positive integer');
});

test('Validators: Pages - reject zero', () => {
    const result = validatePages('0');
    assert(!result.valid, 'Should reject zero pages');
});

test('Validators: Pages - reject negative', () => {
    const result = validatePages('-10');
    assert(!result.valid, 'Should reject negative pages');
});

test('Validators: Pages - reject decimal', () => {
    const result = validatePages('25.5');
    assert(!result.valid, 'Should reject decimal pages');
});

test('Validators: Tag - valid single word', () => {
    const result = validateTag('Fiction');
    assert(result.valid, 'Should accept single word tag');
});

test('Validators: Tag - valid multi-word', () => {
    const result = validateTag('Science Fiction');
    assert(result.valid, 'Should accept multi-word tag');
});

test('Validators: Tag - valid with hyphen', () => {
    const result = validateTag('Non-Fiction');
    assert(result.valid, 'Should accept hyphenated tag');
});

test('Validators: Tag - reject numbers', () => {
    const result = validateTag('Fiction123');
    assert(!result.valid, 'Should reject numbers in tag');
});

test('Validators: Date - valid YYYY-MM-DD', () => {
    const result = validateDate('2025-09-25');
    assert(result.valid, 'Should accept valid date');
});

test('Validators: Date - reject invalid format', () => {
    const result = validateDate('25-09-2025');
    assert(!result.valid, 'Should reject DD-MM-YYYY format');
});

test('Validators: Date - reject invalid month', () => {
    const result = validateDate('2025-13-25');
    assert(!result.valid, 'Should reject invalid month');
});

test('Validators: Date - reject invalid day', () => {
    const result = validateDate('2025-09-32');
    assert(!result.valid, 'Should reject invalid day');
});

// ===========================
// Advanced Regex Tests
// ===========================

test('Advanced Regex: Detect duplicate words', () => {
    const text = 'This is is a test';
    const duplicates = findDuplicateWords(text);
    assert(duplicates.length > 0, 'Should find duplicate word');
    assert(duplicates.includes('is'), 'Should find "is" as duplicate');
});

test('Advanced Regex: No duplicates in clean text', () => {
    const text = 'This is a clean sentence';
    const duplicates = findDuplicateWords(text);
    assertEqual(duplicates.length, 0, 'Should find no duplicates');
});

test('Advanced Regex: Title pattern matches clean text', () => {
    assert(patterns.title.test('Clean Title'), 'Should match clean title');
});

test('Advanced Regex: Title pattern rejects leading space', () => {
    assert(!patterns.title.test(' Leading'), 'Should reject leading space');
});

// ===========================
// Search Tests
// ===========================

test('Search: Compile valid regex', () => {
    const regex = compileRegex('test');
    assert(regex !== null, 'Should compile valid regex');
    assert(regex instanceof RegExp, 'Should return RegExp object');
});

test('Search: Handle invalid regex', () => {
    const regex = compileRegex('[invalid');
    assert(regex === null, 'Should return null for invalid regex');
});

test('Search: Highlight matches', () => {
    const text = 'Hello world';
    const regex = /world/gi;
    const highlighted = highlightMatches(text, regex);
    // Note: depends on our mock implementation
    assert(highlighted.includes('<mark>'), 'Should include <mark> tag');
    assert(highlighted.includes('world'), 'Should include original text');
});

test('Search: Return original text when no regex', () => {
    const text = 'Hello world';
    const highlighted = highlightMatches(text, null);
    assertEqual(highlighted, text, 'Should return original text');
});

// Summary
console.log('\n===========================');
console.log(`Total: ${results.total}, Passed: ${results.passed}, Failed: ${results.failed}`);
if (results.failed > 0) {
    console.log('\nFailures:');
    results.failures.forEach(f => console.log(`- ${f.name}: ${f.error}`));
    process.exit(1);
} else {
    console.log('\nAll tests passed!');
    process.exit(0);
}
