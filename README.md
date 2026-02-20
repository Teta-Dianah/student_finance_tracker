# Student Finance Tracker

A privacy-focused, responsive web application for managing student finances. Built with Vanilla HTML, CSS, and JavaScript.

**Live Demo**: [teta-dianah.github.io/student_finance_tracker](http://teta-dianah.github.io/student_finance_tracker)

**Youtube link**: [https://youtu.be/o6RaH6rqJQk]

## Design Sketches
Below are the original hand-drawn/digital sketches used to plan the responsive layout.

### Desktop View
![Desktop Dashboard Sketch](assets/Desktop%20sketch%20dashboard.png)

### Tablet View
![Tablet Dashboard Sketch](assets/Tablet%20sketch%20dashboard.png)

### Mobile View
![Mobile Dashboard Sketch](assets/mobile%20sketch%20dashboard.png)

## Features
- **Dashboard**: High-level overview of total balance, expenses, remaining funds, and top spending category.
- **Expenditure Trend**: Responsive 7-day bar chart showing daily spending.
- **Budget Management**: Set a monthly limit and receive visual/ARIA-live warnings when exceeded.
- **Transactions**: Full CRUD (Create, Read, Update, Delete) capability with local persistence.
- **Search & Sort**: Live Regex-powered search with text highlighting and multiple sorting options.
- **Currency Support**: Support for GBP (Base), USD, and RWF with **manual exchange rates** editable in Settings.
- **A11y First**: Semantic landmarks, skip-to-content links, visible focus states, and ARIA live regions.
- **Theming**: Dark and Light mode support with local persistence.

## Regex Catalog

| Rule | Pattern | Example (Pass) | Example (Fail) | Note |
| :--- | :--- | :--- | :--- | :--- |
| **Description** | `^(?=.*[a-zA-Z])[a-zA-Z0-9]+(?:\s[a-zA-Z0-9]+)*$` | `Lunch 123` | `12345` | Uses **positive lookahead** to ensure at least one letter |
| **Amount** | `^(0|[1-9]\d*)(\.\d{1,2})?$?` | `12.50` | `.50` | Standard currency format |
| **Category** | `/^[A-Za-z]+(?:[ -][A-Za-z]+)*$/` | `Food-Drink` | `Food 1` | Letters, spaces, and hyphens only |
| **Date** | `^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$` | `2026-02-20` | `2026-20-20` | YYYY-MM-DD format validation |

> [!TIP]
> **Manual Rates**: You can customize exactly how much each currency is worth in the [Settings](file:///c:/Users/Emoji%20technogy%20ltd/Downloads/student_life_planner/settings.html) page. Standard rates are set relative to 1 USD.

## Accessibility & Keyboard Map
- **Tab / Shift+Tab**: Navigate between all interactive elements (Links, Buttons, Inputs).
- **Enter / Space**: Activate buttons and links.
- **Skip Link**: Press **Tab** immediately after page load to see the "Skip to main content" link.
- **ARIA Live**: Screen readers will automatically announce:
    - Budget exceeded warnings on the Dashboard.
    - Transaction count results when searching.
    - Form validation errors.

## Testing
Open `tests.html` in any modern browser to run the automated regex validation suite.

## Development Roadmap (Milestones)
- [x] **M1**: Spec & Wireframes (Minimalist Design Plan)
- [x] **M2**: Semantic HTML & Mobile-First CSS
- [x] **M3**: Form Validation & Regex Logic
- [x] **M4**: Rendering, Sorting, and Regex Search
- [x] **M5**: Stats Dashboard & ARIA Live updates
- [x] **M6**: Persistence (Local Storage) & Import/Export
- [x] **M7**: Accessibility Audit & Final Polish
