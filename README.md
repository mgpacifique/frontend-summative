# 📚 Book & Notes Vault

A fully accessible, responsive, vanilla HTML/CSS/JS application for cataloging and managing your personal book collection. Built with semantic structure, mobile-first design, and advanced regex validation and search capabilities.

## 🌐 Live Demo

**GitHub Pages:** [Link to your deployed site]

## 📖 Table of Contents

- [About](#about)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Installation & Usage](#installation--usage)
- [Running Tests](#running-tests)
- [Data Model](#data-model)
- [Author](#author)
- [License](#license)

## 📝 About

Book & Notes Vault is a personal reading catalog application that helps you track your book collection, monitor your reading progress, and manage your reading goals. The application demonstrates modern web development practices including semantic HTML, responsive CSS, modular JavaScript, and comprehensive accessibility features.

## ✨ Features

### Core Features

- **📊 Dashboard & Statistics**
  - **New:** "Top Days" Bar Chart & "Favorite Genres" Pie Chart
  - Total books & pages count
  - Top Author & Average Book Length stats
  - Reading goal tracker with progress bar

- **📚 Book Catalog**
  - Comprehensive book listing (table view on desktop, cards on mobile)
  - Sort by: Date, Title, Pages
  - Live regex-based search with highlighting

- **➕ Add/Edit Books**
  - Comprehensive form with real-time validation
  - Auto-generated IDs and timestamps

- **⚙️ Settings & Data Management**
  - JSON import/export validation
  - Local storage persistence

- **♿ Accessibility First**
  - Semantic HTML structure
  - Keyboard-only navigation support
  - ARIA live regions for dynamic updates
  - WCAG AA compliant color contrast

## 🛠️ Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Flexbox, Grid, Variables, Conic Gradients
- **JavaScript (ES6+)** - Modules, Classes, Async/Await
- **Web APIs** - localStorage, FileReader
- **Node.js** - Test runner (optional)

## 📁 Project Structure

```
frontend-summative/
├── index.html              # Main application page
├── seed.json               # Sample data
├── STATISTICS_LOGIC.md     # Documentation for stats algorithms
├── styles/
│   ├── main.css            # Main application styles
│   └── reset.css           # CSS reset
├── scripts/
│   ├── main.js             # Entry point
│   ├── ui.js               # UI manipulation & Charts
│   ├── state.js            # State management
│   ├── storage.js          # localStorage handling
│   ├── validators.js       # Regex validation
│   └── search.js           # Search logic
├── Tests/
│   ├── run_tests.mjs       # Node.js test runner
│   └── tests.html          # Browser test suite
└── assets/                 # Static assets (docs, seeds, etc.)
```

## 🚀 Installation & Usage

### 1. Clone the repository
```bash
git clone https://github.com/mgpacifique/frontend-summative.git
cd frontend-summative
```

### 2. Run the Application
Simply open `index.html` in your browser, or use a local server:

```bash
# Python
python -m http.server 8000

# Node.js
npx http-server
```
Visit `http://localhost:8000`

## 🧪 Running Tests

### Node.js Tests (Recommended)
This project includes a Node.js test runner for comprehensive logic verification.
```bash
node Tests/run_tests.mjs
```

### Browser Tests
Open `Tests/tests.html` in your browser to run the test suite via the DOM.

## 📊 Data Model

```json
{
  "id": "book_1727000001_001",
  "title": "The Great Gatsby",
  "author": "F Scott Fitzgerald",
  "pages": "180",
  "tag": "Fiction",
  "date": "2025-01-15",
  "notes": "Optional notes...",
  "createdAt": "2025-01-15T10:30:00Z"
}
```

## 👨‍💻 Author

**Pacifique Gatabazi**  
**GitHub:** [@mgpacifique](https://github.com/mgpacifique)  
**Email:** p.gatabazi@alustudent.com

## 📜 License

This project is for educational purposes.
