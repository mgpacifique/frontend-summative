# Dashboard Statistics & Charts Logic Guide

This guide explains the algorithms used to calculate the statistics and visualizations on the dashboard. All logic is implemented in `scripts/ui.js`.

## 1. Data Source
The statistics are calculated based on the `books` array, which is loaded from `localStorage` (or seeded from `seed.json` initially). Each book object has the following relevant structure:
```json
{
  "title": "Book Title",
  "author": "Author Name",
  "pages": "300",
  "tag": "Fiction",
  "date": "2026-02-18"
}
```

## 2. Statistical Metrics

### Average Book Length
**Goal**: Find the mean number of pages per book.
**Logic**: 
1. Sum the `pages` property of all books.
2. Divide by the total number of books.
3. Round to the nearest whole number.
```javascript
const totalPages = books.reduce((sum, book) => sum + parseInt(book.pages), 0);
const avg = Math.round(totalPages / books.length);
```

### Top Author
**Goal**: Identify the author with the most books.
**Logic**:
1. Iterate through the books array.
2. Build a frequency map (dictionary) where keys are author names and values are counts.
3. Iterate through the map to find the author with the highest count.

## 3. Visualizations

### Busiest Reading Days (Bar Chart)
**Goal**: Show which days of the week have the most activity based on the "Date Added".
**Logic**:
1. Initialize an array of 7 counters (Sun-Sat).
2. For each book, parse the `date` string into a JavaScript `Date` object.
3. Use `date.getDay()` to get the day index (0 for Sunday, 6 for Saturday).
4. Increment the corresponding counter.
5. **Normalization**: To draw the bars, we find the maximum count day (e.g., 5 books). The height of each bar is calculated as `(count / max) * 100` percent.

### Favorite Genres (Pie Chart)
**Goal**: Show the distribution of book tags (genres).
**Logic**:
1. **Aggregation**: Count the frequency of each `tag`.
2. **Sorting**: Sort tags from most frequent to least frequent.
3. **Grouping**: Keep the top 5 tags; group all remaining tags into an "Other" category to avoid clutter.
4. **Rendering**:
   - We use a CSS `conic-gradient` to draw the pie chart purely with CSS.
   - We calculate the percentage of eac slice: `count / totalBooks`.
   - Convert percentage to degrees: `percentage * 360`.
   - Build a gradient string: `#color startDeg endDeg, #color2 startDeg2 endDeg2...`.
