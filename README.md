# Erasmus Lisbon City & Events Guide

A lightweight, mobile-first web app built for international students arriving in Lisbon. It combines a filterable student events board, practical first-week city tips, and live local weather.

**Live Demo:** [Lisbon Erasmus Guide](https://ralenaki.github.io/erasmus-lisbon-guide/)

## Features
- **Live Weather Integration:** Fetches real-time temperature and conditions in Lisbon from the public Open-Meteo REST API (`fetch` + JSON).
- **Interactive Filtering & Search:** Filter events by category (Culture, Trips, Social, Sports, Saved) and search by keyword or neighborhood.
- **Persistent Bookmarks:** Uses browser `localStorage` so students can save events without creating an account.
- **Responsive & Accessible UI:** Built mobile-first with CSS Grid, Flexbox, semantic HTML5 landmarks, and basic SEO/GEO metadata (Open Graph + JSON-LD).

## Tech Stack
- HTML5
- CSS3 (Custom Properties, Grid, Flexbox)
- Vanilla JavaScript (ES6+, Fetch API, `localStorage`)

## Next Steps
- Connect events to a headless CMS or JSON endpoint instead of a local array.
- Add an interactive Lisbon neighborhood map view.
