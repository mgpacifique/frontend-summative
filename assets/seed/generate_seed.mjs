import fs from 'fs';

const today = new Date('2026-02-18T12:00:00Z'); // Fixed 'today' as per user context
const oneDay = 24 * 60 * 60 * 1000;

const categories = ['Fiction', 'Non-Fiction', 'Sci-Fi', 'Fantasy', 'Mystery', 'Biography', 'History', 'Technology', 'Self-Help', 'Business'];

const baseBooks = [
    { title: "The Great Gatsby", author: "F Scott Fitzgerald", pages: 180 },
    { title: "Sapiens", author: "Yuval Noah Harari", pages: 443 },
    { title: "Clean Code", author: "Robert C Martin", pages: 464 },
    { title: "1984", author: "George Orwell", pages: 328 },
    { title: "The Art of War", author: "Sun Tzu", pages: 273 },
    { title: "Brief Answers to the Big Questions", author: "Stephen Hawking", pages: 256 },
    { title: "The Hobbit", author: "J R R Tolkien", pages: 310 },
    { title: "Educated", author: "Tara Westover", pages: 334 },
    { title: "Atomic Habits", author: "James Clear", pages: 320 },
    { title: "The Book Thief", author: "Markus Zusak", pages: 552 },
    { title: "Thinking Fast and Slow", author: "Daniel Kahneman", pages: 499 },
    { title: "The Lean Startup", author: "Eric Ries", pages: 336 },
    { title: "Pride and Prejudice", author: "Jane Austen", pages: 432 },
    { title: "Dune", author: "Frank Herbert", pages: 688 },
    { title: "The Alchemist", author: "Paulo Coelho", pages: 197 },
    { title: "Project Hail Mary", author: "Andy Weir", pages: 496 },
    { title: "Klara and the Sun", author: "Kazuo Ishiguro", pages: 303 },
    { title: "The Midnight Library", author: "Matt Haig", pages: 304 },
    { title: "Cloud Cuckoo Land", author: "Anthony Doerr", pages: 640 },
    { title: "Matrix", author: "Lauren Groff", pages: 272 },
    { title: "Harlem Shuffle", author: "Colson Whitehead", pages: 336 },
    { title: "Crossroads", author: "Jonathan Franzen", pages: 592 },
    { title: "Bewilderment", author: "Richard Powers", pages: 288 },
    { title: "The Lincoln Highway", author: "Amor Towles", pages: 592 },
    { title: "Beautiful World, Where Are You", author: "Sally Rooney", pages: 356 },
    { title: "Foundation", author: "Isaac Asimov", pages: 255 },
    { title: "Neuromancer", author: "William Gibson", pages: 271 },
    { title: "Snow Crash", author: "Neal Stephenson", pages: 480 },
    { title: "Hyperion", author: "Dan Simmons", pages: 482 },
    { title: "Ender's Game", author: "Orson Scott Card", pages: 324 }
];

const generatedBooks = [];

// Helper to format date as YYYY-MM-DD
function formatDate(date) {
    return date.toISOString().split('T')[0];
}

// Generate data for the current week (Feb 16 - Feb 22, 2026)
// Today is Wed Feb 18.
// We want trends, so let's put some books on:
// Mon Feb 17, Tue Feb 18, Wed Feb 18, Thu Feb 19 (future), Fri Feb 20 (future)
// And some in previous weeks.

let idCounter = 1;

function addBook(book, dateOffsetDays) {
    const date = new Date(today.getTime() + (dateOffsetDays * oneDay));
    const dateStr = formatDate(date);

    generatedBooks.push({
        id: `book_gen_${Date.now()}_${String(idCounter++).padStart(3, '0')}`,
        title: book.title,
        author: book.author,
        pages: String(book.pages),
        tag: categories[Math.floor(Math.random() * categories.length)],
        date: dateStr,
        notes: `Generated entry for ${dateStr}`,
        createdAt: date.toISOString(),
        updatedAt: date.toISOString()
    });
}

// Recent history (last 30 days distribution)
// Heavy on this week (Feb 16-22)
// Week starts Monday Feb 16.

// Monday Feb 16
addBook(baseBooks[0], -2);
addBook(baseBooks[1], -2);

// Tuesday Feb 17
addBook(baseBooks[2], -1);
addBook(baseBooks[3], -1);

// Wednesday Feb 18 (Today)
addBook(baseBooks[4], 0);
addBook(baseBooks[5], 0);
addBook(baseBooks[6], 0); // Busy day!

// Thursday Feb 19 (Tomorrow)
// addBook(baseBooks[7], 1); 

// Previous weeks to show trend line
// Last week (Feb 9 - Feb 15)
addBook(baseBooks[8], -5); // Feb 13
addBook(baseBooks[9], -7); // Feb 11
addBook(baseBooks[10], -8); // Feb 10

// Two weeks ago (Feb 2 - Feb 8)
addBook(baseBooks[11], -12); // Feb 6
addBook(baseBooks[12], -14); // Feb 4

// Older entries
addBook(baseBooks[13], -25); // Jan 24
addBook(baseBooks[14], -35); // Jan 14
addBook(baseBooks[15], -45); // Jan 4
addBook(baseBooks[16], -60); // Dec

// Random fill for the rest to reach ~40 books
for (let i = 17; i < baseBooks.length; i++) {
    const randomOffset = -Math.floor(Math.random() * 60); // Last 2 months
    addBook(baseBooks[i], randomOffset);
}

// Output to file
fs.writeFileSync('seed.json', JSON.stringify(generatedBooks, null, 2));
console.log('Seed data written to seed.json');
